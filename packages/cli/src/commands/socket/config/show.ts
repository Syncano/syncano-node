import format from 'chalk'
import { echo, warning, error } from '../../../utils/print-tools'

import Command, {Socket} from '../../../base_command'


export default class SocketConfigShow extends Command {
  static description = 'Configure Socket'
  static flags = {}
  static args = [{
    name: 'socketName',
    required: true,
    description: 'name of the Socket',
  }]

  async run () {
    await this.session.isAuthenticated()
    await this.session.hasProject()
    const {args} = this.parse(SocketConfigShow)
    const socket = await Socket.get(args.socketName)

    if (!socket.existRemotely) {
      error(4)('That socket was not synced!')
      echo()
      process.exit(1)
    }

    echo()
    if (socket.spec.config) {
      Object.keys(socket.spec.config).forEach((optionName) => {
        const params = socket.spec.config[optionName]
        const required = params.required ? format.dim('(required)') : ''
        const currentValue = socket.remote.config[optionName]

        echo(format.dim('         name:'), `${format.bold(optionName)} ${required}`)
        echo(format.dim('  description:'), params.description)
        echo(format.dim('        value:'), currentValue)
        echo()
      })
    } else {
      echo(4)('This Socket doesn\'t have any config options.')
      echo()
      process.exit(0)
    }
  }
}
