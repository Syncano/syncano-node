import format from 'chalk';
import Promise from 'bluebird';

import logger from '../utils/debug';
import { echo, error } from '../utils/print-tools';
import { currentTime } from '../utils/date-utils';
import SocketDeployCmd from './socket-sync';


const { debug } = logger('cmd-socket-install');

export default class SocketInstall {
  constructor(context) {
    this.context = context;
    this.session = context.session;
    this.Socket = context.Socket;
    this.registry = new context.Registry();
  }

  async run([socketName, cmd]) {
    if (!socketName) return error('Socket name is a required parameter!');

    return this.registry.searchSocketByName(socketName)
      .then(async (socketFromRegistry) => {
        debug(`socket found: ${socketFromRegistry.name} ${socketFromRegistry.vesrion}`);
        if (!socketFromRegistry) {
          Promise.reject(null);
        }
        this.socketFromRegistry = socketFromRegistry;

        if (cmd.socket) {
          // Socket dependency
          this.socket = await this.Socket.get(cmd.socket);
          return this.socket.addDependency(socketFromRegistry);
        }

        // Project dependency
        this.Socket.add(socketFromRegistry);
        return Promise.resolve();
      })
      .then(() => {
        const status = format.grey('socket added:');
        const name = format.cyan(this.socketFromRegistry.name);
        const version = format.dim(`(${this.socketFromRegistry.version})`);
        echo(7)(`${status} ${currentTime()} ${name} ${version}`);

        const deploy = new SocketDeployCmd(this.context);
        if (cmd.socket) {
          return deploy.run([this.socket.name, {}]);
        }
        return deploy.run([this.socketFromRegistry.name, {}]);
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status === 404) {
            echo();
            echo(4)('No socket found 😕');
            echo(4)(`To search for socket type: ${format.cyan('syncano-cli search <socket name>')}`);
            echo();
            return;
          }
          if (err.response.data && err.response.data.name) {
            // Something wrong with the name
            echo();
            error(4)(format.red(`Socket "${socketName}" has already been installed!`));
            echo(4)(`To upgrade type ${format.cyan(`syncano-cli upgrade ${socketName}`)}`);
            echo();
          }
        } else {
          echo();
          echo(`${format.red(err)}\n`);
          echo();
        }
      });
  }
}
