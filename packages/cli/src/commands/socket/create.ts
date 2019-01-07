import _ from 'lodash'
import path from 'path'
import format from 'chalk'
import inquirer from 'inquirer'
import logger from '../../utils/debug'
import {SimpleSpinner} from '../../commands_helpers/spinner'
import { p, error, echo } from '../../utils/print-tools'

import Command, {Socket} from '../../base_command'

const { debug } = logger('cmd-socket-compile')


export default class SocketCreate extends Command {
  static description = 'Create Socket'
  static flags = {
  }
  static args = [{
    name: 'socketName',
    required: true,
    description: 'Socket name'
  }]

  async run () {
    await this.session.isAuthenticated()
    await this.session.hasProject()

    const {args} = this.parse(SocketCreate)

    let socketName = args.socketName
    if (socketName === '.') {
      socketName = path.parse(process.cwd()).name
    }

    const questions = [{
      name: 'template',
      type: 'list',
      message: p(2)('Choose template for your Socket'),
      choices: Socket.getTemplatesChoices().map((choice) => p(4)(choice)),
      default: 1
    }]

    echo()
    const response = await inquirer.prompt(questions) as any
    const template = response.template.match(/\((.*)\)/)[1]

    echo()
    try {
      const spinner = new SimpleSpinner(p(2)('Creating Socket...')).start()
      const socket = await Socket.create(socketName, template)
      await socket.compile({ updateSocketNPMDeps: true })
      spinner.stop()
      spinner.succeed(p(2)(`Your Socket configuration is stored at ${format.cyan(socket.socketPath)}`))
      echo()
    } catch (err) {
      error(err)
      process.exit(1)
    }
  }
}


