import format from 'chalk'

import Command, {Socket} from '../../../base_command'
import {askQuestions} from '../../../commands_helpers/socket'

export default class SocketConfig extends Command {
  static description = 'Configure Socket'
  static aliases = ['socket:config']
  static flags = {}
  static args = [{
    name: 'socketName',
    required: true,
    description: 'name of the Socket',
  }]

  async run() {
    await this.session.isAuthenticated() || this.exit(1)
    await this.session.hasProject() || this.exit(1)

    const {args} = this.parse(SocketConfig)

    const socket = await Socket.get(args.socketName)

    if (!socket.existRemotely) {
      this.echo()
      this.error(this.p(4)('That Socket was not synced!'))
      this.echo()
      this.exit(1)
    }

    if (!socket.spec.config) {
      this.echo()
      this.warn('That Socket doesn\'t have any configuration options.')
      this.echo()
      this.exit(1)
    }

    this.echo()

    const config = await askQuestions(socket.getConfigOptions())
    try {
      await socket.updateConfig(config)
      this.echo()
      this.echo(4)(format.green('Config updated!'))
      this.echo()
    } catch (err) {
      this.error(err.message, {exit: 1})
    }
      this.exit(0)
  }
}
