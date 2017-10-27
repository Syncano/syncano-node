import path from 'path'
import inquirer from 'inquirer'
import format from 'chalk'
import { p, echo, error } from '../utils/print-tools'

class SocketCreate {
  constructor (context) {
    this.session = context.session
    this.Socket = context.Socket
  }

  async run ([socketNameArg]) {
    let socketName = socketNameArg
    if (socketNameArg === '.') {
      socketName = path.parse(process.cwd()).name
    }

    this.questions = [{
      name: 'template',
      type: 'list',
      message: p(2)('Choose template for your Socket'),
      choices: this.Socket.getTemplatesChoices().map((choice) => p(4)(choice)),
      default: 1
    }]

    echo()
    const response = await inquirer.prompt(this.questions)
    const template = response.template
      .split(' - ')[0] // find name
      .replace(/ /g, '') // strip padding

    echo()
    try {
      const socket = await this.Socket.create(socketName, template)
      echo(4)(`Your Socket configuration is stored at ${format.cyan(socket.getSocketPath())}`)
      echo()
    } catch (err) {
      error(err.message)
    }
  }
}

export default SocketCreate
