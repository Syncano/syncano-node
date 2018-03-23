import format from 'chalk'

import logger from '../utils/debug'
import { echo, error } from '../utils/print-tools'
import { currentTime } from '../utils/date-utils'
import SocketDeployCmd from './socket-deploy'

const { debug } = logger('cmd-socket-install')

export default class SocketAdd {
  constructor (context) {
    this.context = context
    this.session = context.session
    this.Socket = context.Socket
    this.registry = new context.Registry()
  }

  async run ([socketName, cmd]) {
    if (!socketName) return error('Socket name is a required parameter!')

    try {
      const socketFromRegistry = await this.registry.searchSocketByName(socketName)
      debug(`socket found: ${socketFromRegistry.name} ${socketFromRegistry.vesrion}`)
      this.socketFromRegistry = socketFromRegistry

      if (cmd.socket) {
        // Socket dependency
        this.socket = await this.Socket.get(cmd.socket)
        await this.socket.addDependency(socketFromRegistry)
      } else {
        // Project dependency
        await this.Socket.add(socketFromRegistry)
      }

      const status = format.grey('socket added:')
      const name = format.cyan(this.socketFromRegistry.name)
      const version = format.dim(`(${this.socketFromRegistry.version})`)
      echo(7)(`${status} ${currentTime()} ${name} ${version}`)

      const deploy = await new SocketDeployCmd(this.context)

      if (cmd.socket) {
        return deploy.run([this.socket.name, {}])
      }
      return deploy.run([this.socketFromRegistry.name, {}])
    } catch (err) {
      if (err.response) {
        if (err.response.status === 404) {
          echo()
          echo(4)('No socket found 😕')
          echo(4)(`To search for socket type: ${format.cyan('syncano-cli search <socket name>')}`)
          echo()
          return
        }
        if (err.response.data && err.response.data.name) {
          // Something wrong with the name
          echo()
          error(4)(format.red(`Socket "${socketName}" has already been installed!`))
          echo(4)(`To upgrade type ${format.cyan(`syncano-cli upgrade ${socketName}`)}`)
          echo()
        }
      } else {
        echo()
        if(err.message) {
          echo(`${format.red(err.message)}\n`)
        } else {
          echo(`${format.red(err)}\n`)
        }
        echo()
      }
    }
  }
}
