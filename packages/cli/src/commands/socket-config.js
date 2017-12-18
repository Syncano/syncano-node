import { askQuestions } from './helpers/socket'
import { echo, warning, error } from '../utils/print-tools'

export default class SocketConfigCmd {
  constructor (context) {
    this.session = context.session
    this.Socket = context.Socket
  }

  async run ([socketName, cmd]) {
    this.socket = await this.Socket.get(socketName)

    if (!this.socket.existRemotely) {
      echo()
      error(4)('That socket was not synced!')
      echo()
      process.exit(1)
    }

    if (!this.socket.spec.config) {
      echo()
      warning('That Socket doesn\'t have any configuration options.')
      echo()
      process.exit(1)
    }

    echo()

    const config = await askQuestions(this.socket.getConfigOptions())
    await this.socket.updateConfig(config)
    echo()
  }
}
