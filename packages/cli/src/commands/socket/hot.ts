
import _ from 'lodash'
import watchr from 'watchr'
import format from 'chalk'

import logger from '../../utils/debug'
import { SimpleSpinner, GlobalSpinner } from '../../commands_helpers/spinner'
import { p, echo } from '../../utils/print-tools'
import { currentTime, Timer } from '../../utils/date-utils'
import SocketTrace from './trace'
import SocketDeploy from './deploy'
import { CompileError } from '../../utils/errors'

import { flags } from '@oclif/command';

import Command, {Socket} from '../../base_command'

const { debug, info } = logger('cmd-socket-deploy')

const pendingUpdates = {}
const timer = new Timer()


export default class SocketHotDeploy extends Command {
  static description = 'Create Socket'
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

  async run () {
    this.firstRun = {}
    const {args} = this.parse(SocketHotDeploy)
    const {flags} = this.parse(SocketHotDeploy)

    this.mainSpinner = new GlobalSpinner(p(3)(`${format.grey('waiting...')}`))

    echo()
    echo(1)(`🚀 ${format.grey(' Initial sync started...')}`)

    const deployCmd = await SocketDeploy.run([args.socketName || ''])
    this.socketList = deployCmd.socketList

    echo(1)(`🔥 ${format.grey(' Hot deploy started')} ${format.dim('(Hit Ctrl-C to stop)')}`)
    echo()

    info('Starting stalker')
    this.runStalker()
    this.mainSpinner.queueSize += 1
    this.mainSpinner.queueSize += this.socketList.length
    this.mainSpinner.start()

    if (flags.trace) {
      const traces = await SocketTrace.run()
      Promise.all(this.socketList.map((socket) => traces.startCollectingTraces(socket)))
    }
  }

  async deployProject () {
    timer.reset()
    const msg = p(4)(`${format.magenta('project deploy:')} ${currentTime()}`)
    const spinner = new SimpleSpinner(msg).start()
    await this.session.deployProject()
    spinner.stop()
    const status = format.grey('project synced:')
    const duration = timer.getDuration()
    echo(5)(`${status} ${currentTime()} ${duration}`)
  }

  async deploySocket (socket, config?) {
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
      const updateStatus = await socket.update({ config, updateEnv })

      spinner.stop()
      SocketHotDeploy.printUpdateSuccessful(socket.name, updateStatus, deployTimer)
      await updateEnds()
      this.firstRun[socket.name] = true
    } catch (err) {
      debug(err)
      spinner.stop()
      if (err instanceof CompileError) {
        const status = format.red('    compile error:')
        echo(2)(`${status} ${currentTime()} ${format.cyan(socket.name)}\n\n${err.traceback.split('\n').map(line => p(8)(line)).join('\n')}`)
      } else {
        const status = format.red('socket sync error:')
        echo(2)(`${status} ${currentTime()} ${format.cyan(socket.name)} ${format.red(err.message)}`)
      }

      if (this.cmd.bail) {
        SocketHotDeploy.bail()
      }
      updateEnds()
    }
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

    this.localSockets = _.filter(this.socketList, { existLocally: true })
  }

  static bail () {
    echo()
    process.exit(1)
  }

  static printUpdateSuccessful (socketName: string, updateStatus, deployTimer) {
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

  static printUpdateFailed (socketName: string, err, deployTimer) {
    const duration = deployTimer.getDuration()
    const errDetail = JSON.parse(err).detail
    echo(3)(`${format.red('files not synced:')} ${currentTime()} ${socketName} ${duration} ${errDetail}`)
  }
}
