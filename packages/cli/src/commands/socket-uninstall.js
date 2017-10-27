import format from 'chalk'
import inquirer from 'inquirer'

import { socketNotFound } from './helpers/socket'
import { echo, warning, p } from '../utils/print-tools'

export default class SocketUnInstall {
  constructor (context) {
    this.session = context.session
    this.Socket = context.Socket
  }

  async run ([socketName, cmd]) {
    const confirmation = [{
      type: 'confirm',
      name: 'confirm',
      message: p(2)(`Are you sure you want to remove: ${format.red(socketName)}`),
      default: false
    }]

    const socket = await this.Socket.get(socketName)

    if (!socket.existLocally && !socket.existRemotely) {
      socketNotFound()
      process.exit(1)
    }

    const promptResponse = await inquirer.prompt(confirmation)
    if (!promptResponse.confirm) process.exit()
    echo()

    try {
      await this.Socket.uninstall(socket)

      if (socket.isProjectRegistryDependency) {
        echo(4)(`Socket ${format.cyan(socket.name)} has been removed from the project config file...`)
      }
      if (socket.existLocally) {
        echo(4)(`Socket ${format.cyan(socket.name)} has been removed from the project folder...`)
      }
      if (socket.existRemotely) {
        echo(4)(`Socket ${format.cyan(socket.name)} has been removed from the server...`)
      }

      echo(4)(`Socket ${format.cyan(socket.name)} has been ${format.green('successfully')} removed!`)
      echo()
    } catch (err) {
      warning(err)
      echo()
    }
  }
}
