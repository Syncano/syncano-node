import _ from 'lodash';
import format from 'chalk';
import Promise from 'bluebird';

import logger from '../utils/debug';
import { SimpleSpinner } from './helpers/spinner';
import { askQuestions } from './helpers/socket';
import { p, error, echo } from '../utils/print-tools';
import { currentTime, Timer } from '../utils/date-utils';
import { printCompileError } from './helpers/print';


const { debug } = logger('cmd-socket-deploy');

const pendingUpdates = {};
const timer = new Timer();

export default class SocketDeployCmd {
  constructor(context) {
    this.context = context;
    this.session = context.session;
    this.Socket = context.Socket;
    this.registry = new context.Registry();
    this.firstRun = true;
  }

  async run([socketName, cmd]) {
    this.cmd = cmd;

    // echo(2)(`♻️ ${format.grey(' Deploying...')}`);
    echo();

    if (socketName) {
      debug(`Deploying Socket: ${socketName}`);
      const msg = p(2)(`${format.magenta('getting sockets:')} ${currentTime()}`);
      const spinner = new SimpleSpinner(msg).start();
      this.socketList = await this.Socket.flatList(socketName);
      const socket = _.find(this.socketList, { name: socketName });
      spinner.stop();

      if (!(socket.existLocally || socket.isProjectRegistryDependency || socket.isDependencySocket)) {
        echo();
        error(4)(`Socket ${format.cyan(socketName)} cannot be found!`);
        echo();
        process.exit(1);
      }
    } else {
      const msg = p(2)(`${format.magenta('getting sockets:')} ${currentTime()}`);
      const spinner = new SimpleSpinner(msg).start();
      this.socketList = await this.Socket.flatList();
      spinner.stop();
    }

    const configs = {};

    return Promise.each(this.socketList, (socketFromList) => askQuestions(socketFromList.getConfigOptionsToAsk())
      .then((config) => {
        configs[socketFromList.name] = config;
      }))
      .then(() => this.deployProject())
      .then((projectUpdateStatus) =>
        Promise.all(this.socketList.map((socket) => this.deploySocket(socket, configs[socket.name])))
      )
      .then(() => {
        echo();
      })
      .catch((err) => {
        console.log(err)
        if (err.response && err.response.data && err.response.data.detail) {
          error(4)(err.response.data.detail);
        } else {
          error(4)(err);
        }
      });
  }

  async deployProject() {
    timer.reset();
    const msg = p(4)(`${format.magenta('project deploy:')} ${currentTime()}`);
    const spinner = new SimpleSpinner(msg).start();
    return this.session.deployProject()
      .then((deployProjectStatus) => {
        spinner.stop();
        const status = format.grey('project synced:');
        const duration = timer.getDuration();
        echo(5)(`${status} ${currentTime()} ${duration}`);
      });
  }

  async deploySocket(socket, config) {
    debug(`deploySocket: ${socket.name}`);
    const deployTimer = new Timer();
    const msg = p(4)(`${format.magenta('socket deploy:')} ${currentTime()} ${format.cyan(socket.name)}`);
    const spinner = new SimpleSpinner(msg).start();

    // We have co count here updates
    if (!pendingUpdates[socket.name]) { pendingUpdates[socket.name] = 0; }

    pendingUpdates[socket.name] += 1;
    if (pendingUpdates[socket.name] > 1) {
      spinner.stop();
      this.mainSpinner.start();
      debug(`not updating, update pending: ${pendingUpdates[socket.name]}`);
      return;
    }

    // Let's compile and update if it is not hot mode
    return socket.update({ config, withCompilation: true, updateSocketNPMDeps: true, updateEnv: true })
      .then((updateStatus) => {
        spinner.stop();
        SocketDeployCmd.printUpdateSuccessful(socket.name, updateStatus, deployTimer);
        if (updateStatus.status !== 0 && this.cmd.bail) {
          SocketDeployCmd.bail();
        }
      })
      .catch((err) => {
        spinner.stop();
        if (err.errorType === 'compilationError') {
          printCompileError(err, socket.name);
        } else {
          const status = format.red('socket sync error:');
          echo(2)(`${status} ${currentTime()} ${format.cyan(socket.name)} ${format.red(err.message)}`);
        }

        if (this.cmd.bail) {
          SocketDeployCmd.bail();
        }
      });
  }

  getSocketToUpdate(fileName) {
    return this.localSockets.find((socket) => socket.isSocketFile(fileName));
  }

  static bail() {
    echo();
    process.exit(1);
  }

  static printUpdateSuccessful(socketName, updateStatus, deployTimer) {
    debug('printUpdateSuccessful', socketName, updateStatus);
    const duration = format.dim(deployTimer.getDuration());
    const socketNameStr = `${format.cyan(socketName)}`;

    if (updateStatus.status === 'ok') {
      const status = format.grey('socket synced:');
      echo(6)(`${status} ${currentTime()} ${socketNameStr} ${duration}`);
    } else if (updateStatus.status === 'stopped') {
      const status = format.grey('socket in sync:');
      echo(5)(`${status} ${currentTime()} ${socketNameStr} ${duration}`);
    } else if (updateStatus.status === 'error') {
      const errDetail = format.red(updateStatus.message.error);
      const status = format.red('socket not synced:');
      echo(2)(`${status} ${currentTime()} ${socketNameStr} ${duration} ${errDetail}`);
    } else {
      const status = format.red('socket not synced:');
      echo(2)(`${status} ${currentTime()} ${socketNameStr} ${duration}`);
    }
  }
}
