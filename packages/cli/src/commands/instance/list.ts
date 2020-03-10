
import Command from '../../base_command'

export default class InstanceCreateCmd extends Command {
  static description = 'List your instances'
  static flags = {}
  static args = []

  async run() {
    await this.session.isAuthenticated() || this.exit(1)
    const instances = await this.session.getInstances()

    this.echo()
    if (instances.length < 1) {
      this.echo(4)('You don\'t have any instances!')
    } else {
      this.echo(4)('Instances:')
      instances.forEach(instance => {
        this.echo(6)(`- ${instance.name}`)
      })
    }
    this.echo()
    this.exit()
  }
}
