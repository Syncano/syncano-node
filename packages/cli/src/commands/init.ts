import format from 'chalk'
import inquirer from 'inquirer'

import logger from '../utils/debug'
import { createInstance } from './helpers/create-instance'
import { p, echo } from '../utils/print-tools'
import { track } from '../utils/analytics'
import Login from './login'

const { debug } = logger('cmd-init')

class InitCmd {
  context: any
  session: any
  Init: any
  init: any

  constructor (context) {
    debug('InitCmd.constructor')
    this.context = context
    this.session = context.session
    this.Init = context.Init
  }

  async run ([cmd]: any[]) {
    const { project, settings } = this.session
    const { instance } = cmd

    if (process.env.INIT_CWD) {
      track('CLI: install')
    }

    if (!settings.account.authenticated()) {
      echo()
      echo(4)(format.red('You have to be logged in to initialize a new project!'))
      await new Login(this.context).run([])
    }

    this.init = new this.Init()

    const questions = [
      {
        name: 'Location',
        type: 'list',
        message: p(2)('Choose location for your instance'),
        choices: this.Init.getLocationChoices().map(choice => p(4)(choice)),
        default: 0
      },
      {
        name: 'Template',
        type: 'list',
        message: p(2)('Choose template for your project'),
        choices: this.Init.getTemplatesChoices().map(choice => p(4)(choice)),
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
    this.init.templateName = promptResponses.Template.match(/\((.*)\)/)[1]
    this.init.locationName = promptResponses.Location.match(/[a-z0-9]+/)[0]

    await this.session.setLocation(this.init.locationName)

    if (!project && instance) {
      await this.session.checkConnection(instance)
      await this.init.addConfigFiles({ instance, location: this.init.locationName })
      echo(4)(`Your project is attached to ${format.green(instance.name)} instance now!`)

      return this.init.createFilesAndFolders()
    }

    if (!project && !instance) {
      debug('no project, no instance')
      const newInstance = await createInstance()

      await this.init.addConfigFiles({ instance: newInstance.name, location: this.init.locationName })
      echo(4)(`Your project is attached to ${format.green(newInstance.name)} instance now!`)

      this.init.createFilesAndFolders()
      return this.session.load()
    }

    if (this.init.checkConfigFiles()) {
      return this.init.noConfigFiles()
    }
  }
}

export default InitCmd
