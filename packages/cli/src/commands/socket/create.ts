import {flags} from '@oclif/command'
import format from 'chalk'
import inquirer from 'inquirer'
import path from 'path'

import Command, {Socket} from '../../base_command'
import {SimpleSpinner} from '../../commands_helpers/spinner'

export default class SocketCreate extends Command {
  static description = 'Create Socket'
  static flags = {
    template: flags.string()
  }
  static args = [{
    name: 'socketName',
    required: true,
    description: 'Socket name'
  }]

  async run() {
    await this.session.isAuthenticated() || this.exit(1)
    await this.session.hasProject() || this.exit(1)

    const {args, flags} = this.parse(SocketCreate)

    let socketName = args.socketName
    if (socketName === '.') {
      socketName = path.parse(process.cwd()).name
    }

    const questions = [{
      name: 'template',
      type: 'list',
      message: this.p(2)('Choose template for your Socket'),
      choices: Socket.getTemplatesChoices().map(choice => this.p(4)(choice)),
      default: 1
    }]

    this.echo()
    let templateName

    if (flags.template) {
      templateName = flags.template
    } else {
      const response = await inquirer.prompt(questions) as any
      templateName = response.template.match(/\((.*)\)/)[1]
    }

    this.echo()
    try {
      const spinner = new SimpleSpinner(this.p(2)('Creating Socket...')).start()
      const socket = await Socket.create(socketName, templateName)
      await socket.compile({updateSocketNPMDeps: true})
      spinner.stop()
      spinner.succeed(this.p(2)(`Your Socket configuration is stored at ${format.cyan(socket.socketPath)}`))
      this.echo()
    } catch (err) {
      this.error(err)
      this.exit(1)
    }
    this.exit(0)
  }
}
