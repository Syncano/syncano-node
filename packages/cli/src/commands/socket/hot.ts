
import {flags} from '@oclif/command'
import format from 'chalk'
import _ from 'lodash'
import watchr from 'watchr'

import Command, {Socket} from '../../base_command'
import {GlobalSpinner, SimpleSpinner} from '../../commands_helpers/spinner'
import {currentTime, Timer} from '../../utils/date-utils'
import logger from '../../utils/debug'
import {CompileError} from '../../utils/errors'
import {echo, p} from '../../utils/print-tools'

import SocketDeploy from './deploy'
import SocketTrace from './trace'

const {debug, info} = logger('cmd-socket-deploy')

const pendingUpdates = {}
const timer = new Timer()

export default class SocketHotDeploy extends Command {
  static description = 'Hot Deploy Socket'
  static flags = {
    trace: flags.boolean(),
  }
  static args = [{
    name: 'socketName',
    description: 'Socket name'
  }]

  socketList: Socket[]
  localSockets: Socket[]

  firstRun: Record<string, boolean>
  mainSpinner: GlobalSpinner
  cmd: any
  stalker: any

  printUpdateFailed(socketName: string, err, deployTimer) {
    const duration = deployTimer.getDuration()
    const errDetail = JSON.parse(err).detail
    this.echo(3)(`${format.red('files not synced:')} ${currentTime()} ${socketName} ${duration} ${errDetail}`)
  }

  printUpdateSuccessful(socketName: string, updateStatus, deployTimer) {
    debug('printUpdateSuccessful', socketName, updateStatus)
    const duration = format.dim(deployTimer.getDuration())
    const socketNameStr = `${format.cyan(socketName)}`

    if (updateStatus.status === 'ok') {
      const status = format.grey('socket synced:')
      this.echo(6)(`${status} ${currentTime()} ${socketNameStr} ${duration}`)
    } else if (updateStatus.status === 'stopped') {
      // const status = format.grey('socket in sync:');
      // this.echo(5)(`${status} ${currentTime()} ${socketNameStr} ${duration}`);
    } else if (updateStatus.status === 'error') {
      const errDetail = format.red(updateStatus.message.error)
      const status = format.red('socket not synced:')
      this.echo(2)(`${status} ${currentTime()} ${socketNameStr} ${duration} ${errDetail}`)
    } else {
      const status = format.red('socket not synced:')
      this.echo(2)(`${status} ${currentTime()} ${socketNameStr} ${duration}`)
    }
  }

  async run() {
    await this.session.isAuthenticated()
    await this.session.hasProject()

    this.firstRun = {}
    const {args} = this.parse(SocketHotDeploy)
    const {flags} = this.parse(SocketHotDeploy)

    this.mainSpinner = new GlobalSpinner(p(3)(`${format.grey('waiting...')}`))

    this.echo()
    this.echo(1)(`🚀 ${format.grey(' Initial sync started...')}`)


    const deployCmd = await SocketDeploy.run([args.socketName || ''])
    this.socketList = deployCmd.socketList

    this.echo(1)(`🔥 ${format.grey(' Hot deploy started')} ${format.dim('(Hit Ctrl-C to stop)')}`)
    this.echo()

    info('Starting stalker')
    this.runStalker()
    this.mainSpinner.queueSize += 1
    this.mainSpinner.queueSize += this.socketList.length
    this.mainSpinner.start()

    if (flags.trace) {
      const traces = await SocketTrace.run()
      Promise.all(this.socketList.map(socket => traces.startCollectingTraces(socket)))
    }
  }

  async deployProject() {
    timer.reset()
    const msg = p(4)(`${format.magenta('project deploy:')} ${currentTime()}`)
    const spinner = new SimpleSpinner(msg).start()
    await this.session.deployProject()
    spinner.stop()
    const status = format.grey('project synced:')
    const duration = timer.getDuration()
    this.echo(5)(`${status} ${currentTime()} ${duration}`)
  }

  async deploySocket(socket, config?) {
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

    const updateEnds = async () => {
      this.mainSpinner.start()
      // After update we have to understand if we should fire new one
      pendingUpdates[socket.name] -= 1
      if (pendingUpdates[socket.name] > 0) {
        pendingUpdates[socket.name] = 0
        await this.deploySocket(socket, config)
      }
    }

    try {
      const updateEnv = !(this.firstRun[socket.name])
      const updateStatus = await socket.update({config, updateEnv})

      spinner.stop()
      this.printUpdateSuccessful(socket.name, updateStatus, deployTimer)
      await updateEnds()
      this.firstRun[socket.name] = true
    } catch (err) {
      debug(err)
      spinner.stop()
      if (err instanceof CompileError) {
        const status = format.red('    compile error:')
        this.echo(2)(`${status} ${currentTime()} ${format.cyan(socket.name)}\n\n${err.traceback.split('\n').map(line => p(8)(line)).join('\n')}`)
      } else {
        const status = format.red('socket sync error:')
        this.echo(2)(`${status} ${currentTime()} ${format.cyan(socket.name)} ${format.red(err.message)}`)
      }

      if (this.cmd.bail) {
        this.bail()
      }
      updateEnds()
    }
  }

  getSocketToUpdate(fileName) {
    if (fileName.match(/\/test\//)) {
      return false
    }
    return this.localSockets.find(socket => socket.isSocketFile(fileName))
  }

  runStalker() {
    // Stalking files
    debug('watching:', this.session.getProjectPath())
    this.stalker = watchr.create(this.session.getProjectPath())
    this.stalker.on('change', async (changeType, fileName) => {
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

    this.localSockets = _.filter(this.socketList, {existLocally: true})
  }

  bail() {
    this.echo()
    this.exit(1)
  }
}