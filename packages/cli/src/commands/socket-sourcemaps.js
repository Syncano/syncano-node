import format from 'chalk'
import Promise from 'bluebird'

import logger from '../utils/debug'
import { SimpleSpinner, GlobalSpinner } from './helpers/spinner'
import { p, echo } from '../utils/print-tools'
import { currentTime, Timer } from '../utils/date-utils'
import { printCompileError } from './helpers/print'

const { debug } = logger('cmd-socket-sourcemaps')

export default class SocketSourceMapsCmd {
  constructor (context) {
    this.context = context
    this.session = context.session
    this.Socket = context.Socket
    this.registry = new context.Registry()
    this.firstRun = true

    this.mainSpinner = new GlobalSpinner(p(3)(`${format.grey('waiting...')}`))
  }

  async run ([cmd]) {
    this.cmd = cmd

    const msg = p(2)(`${format.magenta('getting sockets:')} ${currentTime()}`)
    const spinner = new SimpleSpinner(msg).start()
    this.socketList = await this.Socket.flatList()
    spinner.stop()

    const configs = {}

    Promise.all(this.socketList.map((socket) => this.buildSocketSourceMap(socket, configs[socket.name])))
    .then(() => {
      echo()
    })
  }

  async buildSocketSourceMap (socket, config) {
    const deployTimer = new Timer()
    const msg = p(1)(`${format.magenta('building source map:')} ${currentTime()} ${format.cyan(socket.name)}`)
    const spinner = new SimpleSpinner(msg).start()

    // Let's compile
    return socket.compile({ withSourceMaps: true })
      .then((resp) => {
        spinner.stop()
        return SocketSourceMapsCmd.printCompileSuccessful(socket.name, deployTimer)
      })
      .catch((err) => {
        spinner.stop()
        printCompileError(err, socket.name)

        if (this.cmd.bail) {
          SocketSourceMapsCmd.bail()
        }
      })
  }

  getSocketToUpdate (fileName) {
    return this.localSockets.find((socket) => socket.isSocketFile(fileName))
  }

  static bail () {
    echo()
    process.exit(1)
  }

  static printCompileSuccessful (socketName, deployTimer) {
    debug('printUpdateSuccessful', socketName)

    const duration = format.dim(deployTimer.getDuration())
    const socketNameStr = `${format.cyan(socketName)}`
    const status = format.grey('source map built:')
    echo(6)(`${status} ${currentTime()} ${socketNameStr} ${duration}`)
    //
    // if (updateStatus.status === 'ok') {
    //   const status = format.grey('socket synced:');
    //   echo(6)(`${status} ${currentTime()} ${socketNameStr} ${duration}`);
    // } else if (updateStatus.status === 'stopped') {
    //   const status = format.grey('socket in sync:');
    //   echo(5)(`${status} ${currentTime()} ${socketNameStr} ${duration}`);
    // } else if (updateStatus.status === 'error') {
    //   const errDetail = format.red(updateStatus.message.error);
    //   const status = format.red('socket not synced:');
    //   echo(2)(`${status} ${currentTime()} ${socketNameStr} ${duration} ${errDetail}`);
    // } else {
    //   const status = format.red('socket not synced:');
    //   echo(2)(`${status} ${currentTime()} ${socketNameStr} ${duration}`);
    // }
  }
}
