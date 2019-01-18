import path from 'path'
import inquirer from 'inquirer'
import format from 'chalk'
import logger from '../utils/debug'
import { SimpleSpinner } from './helpers/spinner'
import { p, echo, error } from '../utils/print-tools'

const { debug } = logger('cmd-socket-deploy')

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
    const template = response.template.match(/\((.*)\)/)[1]

    echo()
    try {
      const spinner = new SimpleSpinner(p(2)('Creating Socket...')).start()
      const socket = await this.Socket.create(socketName, template)
      await socket.compile({ updateSocketNPMDeps: true })
      spinner.stop()
      spinner.succeed(p(2)(`Your Socket configuration is stored at ${format.cyan(socket.socketPath)}`))
      echo()
    } catch (err) {
      debug(err)
      error(err.message)
      process.exit(1)
    }
  }
}

export default SocketCreate
