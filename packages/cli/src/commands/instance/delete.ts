import logger from '../../utils/debug'
import { echo, error } from '../../utils/print-tools'

import Command from '../../base_command'

const { debug } = logger('cmd-instance-delete')

export default class InstanceCreateCmd extends Command {
  static description = 'Delete an instance'
  static flags = {}

  static args = [
    {
      name: 'instanceName',
      required: true,
      description: 'name of the instance',
    }
  ]

  async run () {
    await this.session.isAuthenticated()
    const {args} = this.parse(InstanceCreateCmd)

    try {
      await this.session.deleteInstance(args.instanceName)
      echo()
      echo(4)('Instance was deleted successfully!')
      echo()
    } catch (err) {
      error('Deleting instance failed!')
    }
  }
}
