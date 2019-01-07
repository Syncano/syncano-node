import format from 'chalk'
import { echo, warning, error } from '../../../utils/print-tools'

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

  async run () {
    await this.session.isAuthenticated()
    await this.session.hasProject()
    const {args} = this.parse(SocketConfigSet)

    const socket = await Socket.get(args.socketName)

    if (!socket.existRemotely) {
      echo()
      error(4)('That socket was not synced!')
      echo()
      process.exit(1)
    }

    if (!(socket.spec.config && socket.spec.config[args.configOptionName])) {
      warning('No such config option!')
      process.exit()
    }

    const config = Object.assign({}, socket.remote.config)

    config[args.configOptionName] = args.configOptionValue
    try {
      await socket.updateConfig(config)
      echo()
      echo(4)(format.green('Config updated!'))
      echo()
      process.exit()
    } catch (err) {
      error(err.message)
    }
  }
}
