import format from 'chalk'
import inquirer from 'inquirer'

import logger from '../utils/debug'
import { p, echo, echon, error } from '../utils/print-tools'
import Login from './login'

const { debug } = logger('cmd-init')

class InitCmd {
  constructor (context) {
    debug('InitCmd.constructor')
    this.context = context
    this.session = context.session
    this.Init = context.Init
  }

  async run ([cmd]) {
    if (!this.session.settings.account.authenticated()) {
      echo()
      echo(4)(format.red('You have to be logged in to initialize a new project!'))
      await new Login(this.context).run([])
    }

    this.init = new this.Init()

    const { project } = this.session
    const { instance } = cmd

    const questions = [
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

    const promptResponses = await inquirer.prompt(questions)
    this.init.templateName = promptResponses.Template.match(/\((.*)\)/)[1]

    if (!project && instance) {
      await this.session.checkConnection(instance)
      this.init.addConfigFiles({ instance })
      return this.init.createFilesAndFolders()
    }

    if (!project && !instance) {
      let newInstance = null
      try {
        debug('Creating Instance')
        echo()
        echon(4)('Creating Syncano Instance... ')
        newInstance = await this.session.createInstance()
      } catch (err) {
        echo()
        echo()
        if (err.message === 'No such API Key.') {
          error(4)('It looks like your account key is invalid.')
          echo(4)(`Try ${format.cyan('syncano-cli logout')} and ${format.cyan('syncano-cli login')} again.`)
        } else {
          error(4)(err.message || 'Error while creating instance. Try again!')
        }
        echo()
        process.exit()
      } finally {
        echo(`${format.green('Done')}`)
        echo(4)(`Syncano Instance ${format.cyan(newInstance.name)} has been created!`)
        echo()
      }

      this.init.addConfigFiles({ instance: newInstance.name })
      this.init.createFilesAndFolders()
      return this.session.load()
    }

    if (this.init.checkConfigFiles()) {
      return this.init.noConfigFiles()
    }
  }
}

export default InitCmd
