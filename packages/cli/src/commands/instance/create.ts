import logger from '../../utils/debug'
import { createInstance } from '../../commands_helpers/create-instance'
import Command from '../../base_command'

const { debug } = logger('cmd-instance-create')

export default class InstanceCreateCmd extends Command {
  static description = 'Create new instance'
  static flags = {}

  static args = [
    {
      name: 'instanceName',
      required: true,
      description: 'name of the instance',
    },
    {
      name: 'location',
      description: 'name of the location (possible options: us1, eu1)',
      default: 'eu1'
    },
  ]

  async run () {
    await this.session.isAuthenticated()
    const {args} = this.parse(InstanceCreateCmd)

    if (args.location) {
      await this.session.setLocation(args.location)
    }

    return createInstance(args.instanceName)
  }
}
