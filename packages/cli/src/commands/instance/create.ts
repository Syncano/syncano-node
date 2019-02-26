import Command from '../../base_command'
import {createInstance} from '../../commands_helpers/create-instance'

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

  async run() {
    await this.session.isAuthenticated() || this.exit(1)
    const {args} = this.parse(InstanceCreateCmd)

    if (args.location) {
      await this.session.setLocation(args.location)
    }

    await createInstance(args.instanceName)
    this.exit(0)
  }
}
