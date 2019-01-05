import { askQuestions } from '../../../commands_helpers/socket'
import { echo, warning, error } from '../../../utils/print-tools'

import Command, {Socket} from '../../../base_command'


export default class SocketConfig extends Command {
  static description = 'Configure Socket'
  static aliases = ['socket:config']
  static flags = {}
  static args = [{
    name: 'socketName',
    required: true,
    description: 'name of the Socket',
  }]

  async run () {
    const {args} = this.parse(SocketConfig)

    const socket = await Socket.get(args.socketName)

    if (!socket.existRemotely) {
      echo()
      error(4)('That Socket was not synced!')
      echo()
      process.exit(1)
    }

    if (!socket.spec.config) {
      echo()
      warning('That Socket doesn\'t have any configuration options.')
      echo()
      process.exit(1)
    }

    echo()

    const config = await askQuestions(socket.getConfigOptions())
    await socket.updateConfig(config)
    echo()
  }
}
