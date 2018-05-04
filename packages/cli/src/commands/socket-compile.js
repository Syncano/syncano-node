import format from 'chalk'
import Promise from 'bluebird'

import logger from '../utils/debug'
import { SimpleSpinner } from './helpers/spinner'
import { createInstance } from './helpers/create-instance'
import { askQuestions } from './helpers/socket'
import { p, error, echo } from '../utils/print-tools'
import { currentTime, Timer } from '../utils/date-utils'
import { CompileError } from '../utils/errors'

const { debug } = logger('cmd-socket-deploy')

const pendingUpdates = {}
const timer = new Timer()

export default class SocketCompile {
  constructor (context) {
    this.context = context
    this.session = context.session
    this.Socket = context.Socket
  }

  async run ([socketName, cmd]) {
    this.cmd = cmd

    if (socketName) {
      debug(`Deploying Socket: ${socketName}`)
      const msg = p(2)(`${format.magenta('getting sockets:')} ${currentTime()}`)
      const spinner = new SimpleSpinner(msg).start()
      const socket = await this.Socket.get(socketName)
      spinner.stop()

      if (!socket.existLocally) {
        echo()
        error(4)(`Socket ${format.cyan(socketName)} cannot be found!`)
        echo()
        process.exit(1)
      }
      this.socketList = [socket]
    } else {
      const msg = p(2)(`${format.magenta('getting sockets:')} ${currentTime()}`)
      const spinner = new SimpleSpinner(msg).start()
      this.socketList = await this.Socket.list()
      spinner.stop()
    }

    const configs = {}

    try {
      let index
      for (index in this.socketList) {
        const socket = this.socketList[index]
        if (!socket.isDependency()) {
          await this.compileSocket(socket, configs[socket.name])
        }
      }

      echo()
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        error(4)(err.response.data.detail)
      } else {
        error(4)(err)
      }
      process.exit(1)
    }
  }

  async compileSocket (socket, config) {
    debug(`compileSocket: ${socket.name}`)
    const deployTimer = new Timer()
    const msg = p(4)(`${format.magenta('socket compile:')} ${currentTime()} ${format.cyan(socket.name)}`)
    const spinner = new SimpleSpinner(msg).start()

    // We have co count here updates
    if (!pendingUpdates[socket.name]) { pendingUpdates[socket.name] = 0 }

    pendingUpdates[socket.name] += 1
    if (pendingUpdates[socket.name] > 1) {
      spinner.stop()
      this.mainSpinner.start()
      debug(`not updating, update pending: ${pendingUpdates[socket.name]}`)
      return
    }

    const socketNameStr = `${format.cyan(socket.name)}`

    // Let's compile and update if it is not hot mode
    try {
      await socket.createAllZips()
      spinner.stop()
      const status = format.grey('socket compiled:')
      const duration = format.dim(deployTimer.getDuration())
      echo(6)(`${status} ${currentTime()} ${socketNameStr} ${duration}`)
    } catch (err) {
      debug(err)
      spinner.stop()
      if (err instanceof CompileError) {
        const status = format.red('    compile error:')
        if (err.traceback) {
          echo(2)(`${status} ${currentTime()} ${socketNameStr}\n\n${err.traceback.split('\n').map(line => p(8)(line)).join('\n')}`)
        } else {
          echo(2)(`${status} ${currentTime()} ${socketNameStr} Error while executing 'build' script!`)
        }
      } else {
        const status = format.red('socket sync error:')
        if (err.message) {
          echo(2)(`${status} ${currentTime()} ${socketNameStr} ${format.red(err.message)}`)
        } else {
          echo(2)(`${status} ${currentTime()} ${socketNameStr}`)
          error(err)
        }
      }

      if (this.cmd.bail) {
        SocketDeployCmd.bail()
      }
    }
  }

  getSocketToUpdate (fileName) {
    return this.localSockets.find((socket) => socket.isSocketFile(fileName))
  }

  static bail () {
    echo()
    process.exit(1)
  }

  static printUpdateSuccessful (socketName, updateStatus, deployTimer) {
    debug('printUpdateSuccessful', socketName, updateStatus)
    const duration = format.dim(deployTimer.getDuration())
    const socketNameStr = `${format.cyan(socketName)}`

    if (updateStatus.status === 'ok') {
      const status = format.grey('socket synced:')
      echo(6)(`${status} ${currentTime()} ${socketNameStr} ${duration}`)
    } else if (updateStatus.status === 'stopped') {
      const status = format.grey('socket in sync:')
      echo(5)(`${status} ${currentTime()} ${socketNameStr} ${duration}`)
    } else if (updateStatus.status === 'error') {
      const errDetail = format.red(updateStatus.message.error)
      const status = format.red('socket not synced:')
      echo(2)(`${status} ${currentTime()} ${socketNameStr} ${duration} ${errDetail}`)
    } else {
      const status = format.red('socket not synced:')
      echo(2)(`${status} ${currentTime()} ${socketNameStr} ${duration}`)
    }
  }
}
