import _ from 'lodash'
import watchr from 'watchr'
import format from 'chalk'
import Promise from 'bluebird'

import logger from '../utils/debug'
import { SimpleSpinner, GlobalSpinner } from './helpers/spinner'
import { askQuestions } from './helpers/socket'
import { printCompileError } from './helpers/print'
import { p, error, echo } from '../utils/print-tools'
import { currentTime, Timer } from '../utils/date-utils'
import SocketTraceCmd from './socket-trace'
import CompilationError from '../utils/compile'

const { debug } = logger('cmd-socket-deploy')

const pendingUpdates = {}
const timer = new Timer()

export default class SocketDeployCmd {
  constructor (context) {
    this.context = context
    this.session = context.session
    this.Socket = context.Socket
    this.registry = new context.Registry()
    this.firstRun = true

    this.mainSpinner = new GlobalSpinner(p(3)(`${format.grey('waiting...')}`))
  }

  async run ([socketName, cmd]) {
    this.cmd = cmd

    echo(2)(`🔥 ${format.grey(' Hot deploy started')} ${format.dim('(Hit Ctrl-C to stop)')}`)
    echo()

    if (socketName) {
      debug(`Deploying Socket: ${socketName}`)
      const msg = p(2)(`${format.magenta('getting sockets:')} ${currentTime()}`)
      const spinner = new SimpleSpinner(msg).start()
      this.socketList = await this.Socket.flatList(socketName)
      const socket = _.find(this.socketList, { name: socketName })
      spinner.stop()

      if (!(socket.existLocally || socket.isProjectRegistryDependency || socket.isDependencySocket)) {
        echo()
        error(4)(`Socket ${format.cyan(socketName)} cannot be found!`)
        echo()
        process.exit(1)
      }
    } else {
      const msg = p(2)(`${format.magenta('getting sockets:')} ${currentTime()}`)
      const spinner = new SimpleSpinner(msg).start()
      this.socketList = await this.Socket.flatList()
      spinner.stop()
    }

    const configs = {}

    Promise.each(this.socketList, (socketFromList) => askQuestions(socketFromList.getConfigOptionsToAsk())
      .then((config) => {
        configs[socketFromList.name] = config
      }))
    .then(() => this.deployProject())
    .then((projectUpdateStatus) =>
      Promise.all(this.socketList.map((socket) => this.deploySocket(socket, configs[socket.name])))
    )
    .then(() => {
      debug('Starting stalker')
      this.runStalker()
      this.mainSpinner.queueSize += 1
      this.mainSpinner.queueSize += this.socketList.length
      this.mainSpinner.start()

      if (cmd.trace) {
        const traces = new SocketTraceCmd(this.context, this.mainSpinner)
        Promise.all(this.socketList.map((socket) => traces.startCollectingTraces(socket)))
      }
    })
    .catch((err) => {
      if (err.response && err.response.data && err.response.data.detail) {
        error(4)(err.response.data.detail)
      } else {
        error(4)(err)
      }
    })
  }

  async deployProject () {
    timer.reset()
    const msg = p(4)(`${format.magenta('project deploy:')} ${currentTime()}`)
    const spinner = new SimpleSpinner(msg).start()
    return this.session.deployProject()
      .then((deployProjectStatus) => {
        spinner.stop()
        const status = format.grey('project synced:')
        const duration = timer.getDuration()
        echo(5)(`${status} ${currentTime()} ${duration}`)
      })
  }

  async deploySocket (socket, config) {
    debug(`deploySocket: ${socket.name}`)
    const deployTimer = new Timer()
    const msg = p(4)(`${format.magenta('socket deploy:')} ${currentTime()} ${format.cyan(socket.name)}`)
    this.mainSpinner.stop()
    const spinner = new SimpleSpinner(msg).start()

    // We have to count here number of updates
    if (!pendingUpdates[socket.name]) { pendingUpdates[socket.name] = 0 }

    pendingUpdates[socket.name] += 1
    if (pendingUpdates[socket.name] > 1) {
      spinner.stop()
      this.mainSpinner.start()
      debug(`not updating, update pending: ${pendingUpdates[socket.name]}`)
      return
    }

    const updateEnds = () => {
      this.mainSpinner.start()
      // After update we have to understand if we should fire new one
      pendingUpdates[socket.name] -= 1
      if (pendingUpdates[socket.name] > 0) {
        pendingUpdates[socket.name] = 0
        this.deploySocket(socket, config)
      }
    }

    return socket.update({ config })
      .then((updateStatus) => {
        spinner.stop()
        SocketDeployCmd.printUpdateSuccessful(socket.name, updateStatus, deployTimer)
        updateEnds()
      })
      .catch((err) => {
        spinner.stop()
        if (typeof err === 'object') {
          if (err instanceof CompilationError) {
            printCompileError(err, socket.name)
          } else {
            const status = format.red('socket sync error:')
            echo(2)(`${status} ${currentTime()} ${format.cyan(socket.name)} ${format.red(err.message)}`)
          }
        } else {
          SocketDeployCmd.printUpdateFailed(socket.name, err, deployTimer)
        }
        updateEnds()
      })
  }

  getSocketToUpdate (fileName) {
    if (fileName.match(/\/test\//)) {
      return false
    }
    return this.localSockets.find((socket) => socket.isSocketFile(fileName))
  }

  runStalker () {
    // Stalking files
    debug('watching:', this.session.projectPath)
    this.stalker = watchr.create(this.session.projectPath)
    this.stalker.on('change', (changeType, fileName) => {
      timer.reset()
      const socketToUpdate = this.getSocketToUpdate(fileName)
      if (socketToUpdate) {
        this.deploySocket(socketToUpdate)
      }
    })

    this.stalker.setConfig({
      interval: 300,
      persistent: true,
      catchupDelay: 300,
      preferredMethods: ['watch', 'watchFile'],
      followLinks: true,
      ignoreHiddenFiles: true, // ignoring .bundles, .dist etc.
      ignoreCommonPatterns: true
    })

    // First start of the stalker
    this.stalker.watch(() => {})

    this.localSockets = _.filter(this.socketList, { existLocally: true })
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
      // const status = format.grey('socket in sync:');
      // echo(5)(`${status} ${currentTime()} ${socketNameStr} ${duration}`);
    } else if (updateStatus.status === 'error') {
      const errDetail = format.red(updateStatus.message.error)
      const status = format.red('socket not synced:')
      echo(2)(`${status} ${currentTime()} ${socketNameStr} ${duration} ${errDetail}`)
    } else {
      const status = format.red('socket not synced:')
      echo(2)(`${status} ${currentTime()} ${socketNameStr} ${duration}`)
    }
  }

  static printUpdateFailed (socketName, err, deployTimer) {
    const duration = deployTimer.getDuration()
    const errDetail = JSON.parse(err).detail
    echo(3)(`${format.red('files not synced:')} ${currentTime()} ${socketName} ${duration} ${errDetail}`)
  }
}
