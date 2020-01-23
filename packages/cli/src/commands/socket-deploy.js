import format from 'chalk'
import Promise from 'bluebird'

import Listr from 'listr'
import VerboseRenderer from 'listr-verbose-renderer'

import logger from '../utils/debug'
import { createInstance } from './helpers/create-instance'
import { askQuestions } from './helpers/socket'
import { p, error, echo } from '../utils/print-tools'
import { currentTime, Timer } from '../utils/date-utils'
import { CompileError } from '../utils/errors'
import { printInstanceInfo } from './helpers/instance'

const { debug, info } = logger('cmd-socket-deploy')

const pendingUpdates = {}
const timer = new Timer()

export default class SocketDeployCmd {
  constructor (context) {
    this.context = context
    this.session = context.session
    this.Socket = context.Socket
    this.init = new context.Init()
    this.firstRun = true
  }

  async run ([socketName, cmd]) {
    this.cmd = cmd

    // Create Instance if --create-instance provided
    if (cmd.createInstance) {
      await createInstance(cmd.createInstance)
      await this.init.addConfigFiles({ instance: cmd.createInstance })
    } else {
      // If not, we have to check if we have a project attached to any instance
      this.session.hasProject()
    }

    printInstanceInfo(this.session, 11)
    echo()

    if (socketName) {
      info('deploying socket', socketName)
      const socket = await this.Socket.get(socketName)

      if (!socket.existLocally) {
        echo()
        error(4)(`Socket ${format.cyan(socketName)} cannot be found!`)
        echo()
        process.exit(1)
      }
      this.socketList = [socket]
    } else {
      this.socketList = await this.Socket.list()
    }

    const configs = {}

    try {
      const deployList = []
      this.socketList.forEach(socket => {
        deployList.push({
          title: `${format.grey('        waiting:')} ${socket.name}`,
          task: async (ctx, task) => {
            task.title = `${format.grey(' syncing socket:')} ${socket.name}`
            const deployStatus = await this.deploySocket(socket, configs[socket.name])
            if (deployStatus.status !== 'pending') {
              task.title = SocketDeployCmd.printSummary(socket.name, deployStatus)
            }
            if (deployStatus.status === 'error' || deployStatus.status === 'compile error') {
              throw new Error()
            }
          }
        })
      })

      const listsOptions = {
        concurrent: cmd.parallel || false,
        renderer: process.env.CI ? VerboseRenderer : 'default',
        exitOnError: cmd.bail || false
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
      await Promise.each(this.socketList, async (socketFromList) => {
        const config = await askQuestions(socketFromList.getConfigOptionsToAsk())
        configs[socketFromList.name] = config
      })

      const deployTimer = new Timer()
      echo(2)('         settings:')
      await projectTasks.run()
      echo()

      if (this.socketList.length > 0) {
        echo(2)('          sockets:')
        await socketsTasks.run()
        echo()
      }
      echo(2)(format.grey(`       total time: ${deployTimer.getDuration()}`))
      echo()
    } catch (err) {
      SocketDeployCmd.bail()
    }
    return this
  }

  async deployProject () {
    timer.reset()
    await this.session.deployProject()
    return timer.getDuration()
  }

  async deploySocket (socket, config) {
    debug(`deploySocket: ${socket.name}`)
    const deployTimer = new Timer()

    // We have co count here updates
    if (!pendingUpdates[socket.name]) { pendingUpdates[socket.name] = 0 }

    pendingUpdates[socket.name] += 1
    if (pendingUpdates[socket.name] > 1) {
      debug(`not updating, update pending: ${pendingUpdates[socket.name]}`)
      return {status: 'pending'}
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
        status: 'error',
        duration: deployTimer.getDuration()
      }
      if (err instanceof CompileError) {
        errorStatus.status = 'compile error'
        if (err.traceback) {
          errorStatus.message = err.traceback.split('\n').map(line => p(8)(line)).join('\n')
        } else {
          errorStatus.message = 'Error while executing socket `build` script!'
        }
      } else {
        errorStatus.message = err.message ? err.message : err
      }
      return errorStatus
    }
  }

  getSocketToUpdate (fileName) {
    return this.localSockets.find((socket) => socket.isSocketFile(fileName))
  }

  static printSummary (socketName, updateStatus) {
    debug('printSummary()', socketName, updateStatus)
    const duration = format.dim(updateStatus.duration)
    const socketNameStr = `${format.cyan(socketName)}`

    if (updateStatus.status === 'ok') {
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

  static bail () {
    echo()
    process.exit(1)
  }
}
