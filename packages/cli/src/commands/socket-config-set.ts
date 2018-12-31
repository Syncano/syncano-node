import { echo, error, warning } from '../utils/print-tools'

export default class SocketConfigSetCmd {
  session: any
  Socket: any
  socket: any

  constructor (context) {
    this.session = context.session
    this.Socket = context.Socket
  }

  async run ([socketName, optionName, optionValue, cmd]: any[]) {
    this.socket = await this.Socket.get(socketName)

    if (!this.socket.existRemotely) {
      echo()
      error(4)('That socket was not synced!')
      echo()
      process.exit(1)
    }

    if (!(this.socket.spec.config && this.socket.spec.config[optionName])) {
      warning('No such config option!')
      process.exit()
    }

    const config = Object.assign({}, this.socket.remote.config)

    config[optionName] = optionValue
    try {
      await this.socket.updateConfig(config)
      process.exit()
    } catch (err) {
      error(err.message)
    }
  }
}
