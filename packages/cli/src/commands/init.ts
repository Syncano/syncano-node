import format from 'chalk'
import inquirer from 'inquirer'

import logger from '../utils/debug'
import { createInstance } from '../commands_helpers/create-instance'
import { p, echo } from '../utils/print-tools'
import { track } from '../utils/analytics'
import Login from './login'

const { debug } = logger('cmd-init')

import Command, {Init} from '../base_command'


export default class InitCmd extends Command {
  static description = 'Init Syncano instance'
  static flags = {}
  static args = [{
    name: 'instance',
    description: 'Instance Name'
  }]

  async run () {
    await this.session.isAuthenticated()
    const {args} = this.parse(InitCmd)

    const { project, settings } = this.session
    const instance = args.instance

    if (process.env.INIT_CWD) {
      track('CLI: install')
    }

    if (!settings.account.authenticated()) {
      echo()
      echo(4)(format.red('You have to be logged in to initialize a new project!'))
      await Login.run()
    }

    const init = new Init()

    const questions = [
      {
        name: 'Location',
        type: 'list',
        message: p(2)('Choose location for your instance'),
        choices: Init.getLocationChoices().map(choice => p(4)(choice)),
        default: 0
      },
      {
        name: 'Template',
        type: 'list',
        message: p(2)('Choose template for your project'),
        choices: Init.getTemplatesChoices().map(choice => p(4)(choice)),
        default: 1
      }
    ]

    if (!project) {
      echo()
      echo(4)(format.cyan('New project? Exciting! 🎉'))
      echo()
    } else {
      echo()
      echo(4)('I found the Syncano instance for the project in this folder,')
      echo(4)("but you don't have any config files - I'll create them for you!")
      echo()
    }

    const promptResponses = await inquirer.prompt(questions) as any
    init.templateName = promptResponses.Template.match(/\((.*)\)/)[1]
    init.locationName = promptResponses.Location.match(/[a-z0-9]+/)[0]

    await this.session.setLocation(init.locationName)

    if (!project && instance) {
      await this.session.checkConnection(instance)
      await init.addConfigFiles({ instance, location: init.locationName })
      echo(4)(`Your project is attached to ${format.green(instance.name)} instance now!`)

      return init.createFilesAndFolders()
    }

    if (!project && !instance) {
      debug('no project, no instance')
      const newInstance = await createInstance()

      await init.addConfigFiles({ instance: newInstance.name, location: init.locationName })
      echo(4)(`Your project is attached to ${format.green(newInstance.name)} instance now!`)

      init.createFilesAndFolders()
      return this.session.load()
    }

    if (init.checkConfigFiles()) {
      return init.noConfigFiles()
    }
  }
}


