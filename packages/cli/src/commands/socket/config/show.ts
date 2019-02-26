import format from 'chalk'

import Command, {Socket} from '../../../base_command'

export default class SocketConfigShow extends Command {
  static description = 'Configure Socket'
  static flags = {}
  static args = [{
    name: 'socketName',
    required: true,
    description: 'name of the Socket',
  }]

  async run() {
    await this.session.isAuthenticated()
    await this.session.hasProject()
    const {args} = this.parse(SocketConfigShow)
    const socket = await Socket.get(args.socketName)

    if (!socket.existRemotely) {
      this.error(this.p(4)('That socket was not synced!'))
      this.echo()
      this.exit(1)
    }

    this.echo()
    if (socket.spec.config) {
      Object.keys(socket.spec.config).forEach(optionName => {
        const params = socket.spec.config[optionName]
        const required = params.required ? format.dim('(required)') : ''
        const currentValue = socket.remote.config[optionName]

        this.echo(format.dim('         name:'), `${format.bold(optionName)} ${required}`)
        this.echo(format.dim('  description:'), params.description)
        this.echo(format.dim('        value:'), currentValue)
        this.echo()
      })
    } else {
      this.echo(4)('This Socket doesn\'t have any config options.')
      this.echo()
      this.exit(0)
    }
  }
}
