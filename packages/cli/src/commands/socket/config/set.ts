import format from 'chalk'

import Command, {Socket} from '../../../base_command'

export default class SocketConfigSet extends Command {
  static description = 'Configure Socket'
  static flags = {}
  static args = [{
    name: 'socketName',
    required: true,
    description: 'name of the Socket',
  },
  {
    name: 'configOptionName',
    required: true,
    description: 'config option name',
  },
  {
    name: 'configOptionValue',
    required: true,
    description: 'config option value',
  }]

  async run() {
    await this.session.isAuthenticated()
    await this.session.hasProject()
    const {args} = this.parse(SocketConfigSet)

    const socket = await Socket.get(args.socketName)

    if (!socket.existRemotely) {
      this.echo()
      this.error(this.p(4)('That socket was not synced!'), {exit: 1})
    }

    if (!(socket.spec.config && socket.spec.config[args.configOptionName])) {
      this.echo()
      this.error('No such config option!', {exit: 1})
    }

    const config = {...socket.remote.config}

    config[args.configOptionName] = args.configOptionValue
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
