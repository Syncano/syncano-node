
import Command from '../../base_command'

export default class InstanceCreateCmd extends Command {
  static description = 'Delete an instance'
  static flags = {}
  static args = []

  async run() {
    await this.session.isAuthenticated() || this.exit(1)
    const instances = await this.session.getInstances()

    if (instances.length < 1) {
      this.echo()
      this.echo(4)('You don\'t have any instances!')
      this.echo()
      this.exit(1)
    } else {
      this.echo()
      this.echo(4)('Instances:')
      instances.forEach(instance => {
        this.echo(6)(`- ${instance.name}`)
      })
      this.echo()
      this.exit()
    }
  }
}
