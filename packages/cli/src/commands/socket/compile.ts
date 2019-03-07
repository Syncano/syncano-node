import format from 'chalk'

import Command, {Socket} from '../../base_command'
import {SimpleSpinner} from '../../commands_helpers/spinner'
import {currentTime, Timer} from '../../utils/date-utils'
import logger from '../../utils/debug'
import {CompileError} from '../../utils/errors'

const {debug} = logger('cmd-socket-compile')

const pendingUpdates = {}
export default class SocketCompile extends Command {
  static description = 'Trace Socket calls'
  static flags = {}
  static args = [{
    name: 'socketName',
    required: true,
    description: 'name of the Socket',
  }]

  context: any
  session: any
  Socket: any
  socketList: any
  mainSpinner: any
  cmd: any
  localSockets: any

  async run() {
    await this.session.isAuthenticated()
    await this.session.hasProject()

    const {args} = this.parse(SocketCompile)

    this.echo()
    if (args.socketName) {
      debug(`Deploying Socket: ${args.socketName}`)
      const msg = this.p(2)(`${format.magenta('getting socket:')} ${currentTime()}`)
      const spinner = new SimpleSpinner(msg).start()
      const socket = await Socket.get(args.socketName)
      spinner.stop()

      if (!socket.existLocally) {
        this.echo()
        this.error(this.p(4)(`Socket ${format.cyan(args.socketName)} cannot be found!`))
        this.echo()
        this.exit(1)
      }
      this.socketList = [socket]
    } else {
      const msg = this.p(2)(`${format.magenta('getting sockets:')} ${currentTime()}`)
      const spinner = new SimpleSpinner(msg).start()
      this.socketList = await Socket.list()
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

      this.echo()
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        this.error(this.p(4)(err.response.data.detail))
      } else {
        this.error(this.p(4)(err))
      }
      this.exit(1)
    }
    this.exit(0)
  }

  async compileSocket(socket, config) {
    debug(`compileSocket: ${socket.name}`)
    const deployTimer = new Timer()
    const msg = this.p(4)(`${format.magenta('socket compile:')} ${currentTime()} ${format.cyan(socket.name)}`)
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
      this.echo(6)(`${status} ${currentTime()} ${socketNameStr} ${duration}`)
    } catch (err) {
      debug(err)
      spinner.stop()
      if (err instanceof CompileError) {
        const status = format.red('    compile error:')
        if (err.traceback) {
          this.echo(2)(`${status} ${currentTime()} ${socketNameStr}\n\n${err.traceback.split('\n').map(line => this.p(8)(line)).join('\n')}`)
        } else {
          this.echo(2)(`${status} ${currentTime()} ${socketNameStr} Error while executing 'build' script!`)
        }
      } else {
        const status = format.red('socket sync error:')
        if (err.message) {
          this.echo(2)(`${status} ${currentTime()} ${socketNameStr} ${format.red(err.message)}`)
        } else {
          this.echo(2)(`${status} ${currentTime()} ${socketNameStr}`)
          this.error(err)
        }
      }
    }
  }

  getSocketToUpdate(fileName) {
    return this.localSockets.find(socket => socket.isSocketFile(fileName))
  }
}
