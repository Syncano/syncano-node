import format from 'chalk'
import inquirer from 'inquirer'

import Command, {Socket} from '../../base_command'
import {socketNotFound} from '../../commands_helpers/socket'

export default class SocketUnInstall extends Command {
  static description = 'Uninstall Socket'
  static flags = {}
  static args = [{
    name: 'socketName',
    required: true,
    description: 'name of the Socket',
  }]

  async run() {
    await this.session.isAuthenticated()
    await this.session.hasProject()

    const {args} = this.parse(SocketUnInstall)
    const {flags} = this.parse(SocketUnInstall)

    const confirmation = [{
      type: 'confirm',
      name: 'confirm',
      message: this.p(2)(`Are you sure you want to remove: ${format.red(args.socketName)}`),
      default: false
    }]

    const socket = await Socket.get(args.socketName)

    if (!socket.existLocally && !socket.existRemotely) {
      socketNotFound()
      this.exit(1)
    }

    this.echo()
    const promptResponse = await inquirer.prompt(confirmation) as any
    if (!promptResponse.confirm) this.exit()
    this.echo()

    try {
      await Socket.uninstall(socket)

      if (socket.isProjectRegistryDependency) {
        this.echo(4)(`Socket ${format.cyan(socket.name)} has been removed from the project config file...`)
      }
      if (socket.existLocally) {
        this.echo(4)(`Socket ${format.cyan(socket.name)} has been removed from the project folder...`)
      }
      if (socket.existRemotely) {
        this.echo(4)(`Socket ${format.cyan(socket.name)} has been removed from the server...`)
      }

      this.echo(4)(`Socket ${format.cyan(socket.name)} has been ${format.green('successfully')} removed!`)
      this.echo()
    } catch (err) {
      this.warn(err)
      this.echo()
    }
  }
}
