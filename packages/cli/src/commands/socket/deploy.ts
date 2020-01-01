import {flags} from '@oclif/command'
import BluebirdPromise from 'bluebird'
import format from 'chalk'
import Listr from 'listr'
import VerboseRenderer from 'listr-verbose-renderer'

import Command, {Init, Socket} from '../../base_command'
import {createInstance} from '../../commands_helpers/create-instance'
import {printInstanceInfo} from '../../commands_helpers/instance'
import {askQuestions} from '../../commands_helpers/socket'
import {currentTime, Timer} from '../../utils/date-utils'
import logger from '../../utils/debug'
import {CompileError} from '../../utils/errors'
import {UpdateStatus} from '../../utils/sockets/sockets'


const {debug, info} = logger('cmd-socket-deploy')

type TTask = {
  title: string;
  task: (ctx: any, task: any) => Promise<void>;
}

type TSocketConfig = {
  [s in string]: any
}

type TPendingUpdates = {
  [s in string]: number
}

type SocketConfig = {}

const pendingUpdates: TPendingUpdates = {}
const timer = new Timer()

export default class SocketDeploy extends Command {
  static description = 'Deploy Socket'
  static aliases = ['deploy']
  static flags = {
    'create-instance': flags.string(),
    parallel: flags.boolean(),
    bail: flags.boolean(),
  }
  static args = [{
    name: 'socketName',
    description: 'Socket name'
  }]

  static printSummary(socketName: string, updateStatus: UpdateStatus) {
    debug('printSummary()', socketName, updateStatus)
    const duration = format.dim(updateStatus.duration)
    const socketNameStr = `${format.cyan(socketName)}`

    if (updateStatus.status === 'ok' || updateStatus.status === 'pending') {
      const status = format.grey('  socket synced:')
      return `${status} ${currentTime()} ${socketNameStr} ${duration}`
    } else if (updateStatus.status === 'stopped') {
      const status = format.grey(' socket in sync:')
      return `${status} ${currentTime()} ${socketNameStr} ${duration}`
    } else if (updateStatus.status === 'error') {
      const status = format.red(' socket not synced:')
      return `${status} ${currentTime()} ${socketNameStr} ${duration} \n\n${updateStatus.message}`
    } else if (updateStatus.status === 'compile error') {
      const status = format.red('  compile error:')
      return `${status} ${currentTime()} ${socketNameStr} ${duration} \n\n${updateStatus.message}`
    } else {
      const status = format.red(' socket not synced:')
      return `${status} ${currentTime()} ${socketNameStr} ${duration}`
    }
  }

  firstRun = true
  socketList: Socket[] = []
  localSockets: Socket[] = []

  async run() {
    await this.session.isAuthenticated()

    this.firstRun = true
    const {args} = this.parse(SocketDeploy)
    const {flags} = this.parse(SocketDeploy)

    // Create Instance if --create-instance provided
    if (flags['create-instance']) {
      await createInstance(flags['create-instance'])
      const init = new Init()
      await init.addConfigFiles({instance: flags['create-instance']})
    } else {
      // If not, we have to check if we have a project attached to any instance
      await this.session.hasProject()
    }

    this.echo()
    printInstanceInfo(this.session, 11)
    this.echo()

    if (args.socketName) {
      info('deploying socket', args.socketName)
      const socket = await Socket.get(args.socketName)

      if (!socket.existLocally) {
        this.echo()
        this.error(this.p(4)(`Socket ${format.cyan(args.socketName)} cannot be found!`))
        this.echo()
        this.exit(1)
      }
      this.socketList = [socket]
    } else {
      this.socketList = await Socket.list()
    }

    const configs: TSocketConfig = {}

    try {
      const deployList: TTask[] = []
      this.socketList.forEach(socket => {
        deployList.push({
          title: `${format.grey('        waiting:')} ${socket.name}`,
          task: async (ctx, task) => {
            task.title = `${format.grey(' syncing socket:')} ${socket.name}`
            const deployStatus = await this.deploySocket(socket, configs[socket.name])

            if (deployStatus.status === 'error' || deployStatus.status === 'compile error') {
              throw new Error()
            } else {
              task.title = SocketDeploy.printSummary(socket.name, deployStatus)
            }
          }
        })
      })

      const listsOptions = {
        concurrent: flags.parallel || false,
        renderer: process.env.CI ? VerboseRenderer : 'default',
        exitOnError: flags.bail || false
      }

      const projectTasks = new Listr([
        {
          title: `${format.grey('        project:')} checking... `,
          task: async (ctx, task) => {
            const duration = await this.deployProject()
            task.title = `${format.grey('        project:')} ${currentTime()} updated ${format.grey(duration)}`
          }
        }
      ],
      listsOptions
      )

      const socketsTasks = new Listr(deployList, listsOptions)

      // Ask for missing config options
      await BluebirdPromise.each(this.socketList, async (socketFromList: Socket) => {
        const config = await askQuestions(socketFromList.getConfigOptionsToAsk()) || {}
        configs[socketFromList.name] = config
      })

      const deployTimer = new Timer()
      this.echo(2)('         settings:')
      await projectTasks.run()
      this.echo()

      if (this.socketList.length > 0) {
        this.echo(2)('          sockets:')
        await socketsTasks.run()
        this.echo()
      }
      this.echo(2)(format.grey(`       total time: ${deployTimer.getDuration()}`))
      this.echo()
    } catch (err) {
      this.bail()
    }
    this.exit(0)
  }

  async deployProject() {
    timer.reset()
    await this.session.deployProject()
    return timer.getDuration()
  }

  async deploySocket(socket: Socket, config: SocketConfig): Promise<UpdateStatus> {
    debug(`deploySocket: ${socket.name}`)
    const deployTimer = new Timer()

    // We have co count here updates
    if (!pendingUpdates[socket.name]) { pendingUpdates[socket.name] = 0 }

    pendingUpdates[socket.name] += 1
    if (pendingUpdates[socket.name] > 1) {
      debug(`not updating, update pending: ${pendingUpdates[socket.name]}`)
      return {status: 'pending', type: 'wait'}
    }

    try {
      const updateStatus = await socket.update({
        config,
        withCompilation: true,
        updateSocketNPMDeps: true,
        updateEnv: true
      })
      updateStatus.duration = deployTimer.getDuration()
      return updateStatus
    } catch (err) {
      debug(err)
      const errorStatus = {
        type: 'fail',
        status: 'error',
        duration: deployTimer.getDuration(),
        message: null
      }
      if (err instanceof CompileError) {
        errorStatus.status = 'compile error'
        if (err.traceback) {
          errorStatus.message = err.traceback.split('\n').map(line => this.p(8)(line)).join('\n')
        } else {
          errorStatus.message = 'Error while executing socket `build` script!'
        }
      } else {
        errorStatus.message = err.message ? err.message : err
      }
      return errorStatus as UpdateStatus
    }
  }

  getSocketToUpdate(fileName: any) {
    return this.localSockets.find(socket => socket.isSocketFile(fileName))
  }

  bail() {
    this.echo()
    this.exit(1)
  }
}
