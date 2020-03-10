import Command from '../../base_command'

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

  async run() {
    await this.session.isAuthenticated() || this.exit(1)
    const {args} = this.parse(InstanceCreateCmd)

    try {
      await this.session.deleteInstance(args.instanceName)
      this.echo()
      this.echo(4)(`Syncano Instance ${args.instanceName} has been deleted successfully.`)
      this.echo()
    } catch (err) {
      this.error('Deleting instance failed!', {exit: 1})
    }
    this.exit(0)
  }
}
