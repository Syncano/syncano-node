
import { echo } from '../../utils/print-tools'
import Command from '../../base_command'

export default class InstanceCreateCmd extends Command {
  static description = 'Delete an instance'
  static flags = {}
  static args = []

  async run () {
    await this.session.isAuthenticated()
    const instances = await this.session.getInstances()

    if (instances.length < 1) {
      echo()
      echo(4)('You don\'t have any instances!')
      echo()
    } else {
      echo()
      echo(4)('Instances:')
      instances.forEach(instance => {
        echo(6)(`- ${instance.name}`)
      })
      echo()
    }
  }
}
