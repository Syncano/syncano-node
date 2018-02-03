import inquirer from 'inquirer'

import logger from '../utils/debug'
import { p, echo } from '../utils/print-tools'
import genUniqueInstanceName from '../utils/unique-instance'
import { createInstance } from './helpers/create-instance'

const { debug } = logger('cmd-attach')

class Attach {
  constructor (context) {
    debug('Attach.constructor')
    this.session = context.session
    this.Init = context.Init
  }

  async run ([cmd = {}]) {
    this.cmd = cmd
    this.init = new this.Init()

    if (this.session.project) {
      const confirmQuestion = [{
        type: 'confirm',
        name: 'confirm',
        message: p(2)('This project is already attached. Are you sure you want to change instance?'),
        default: false
      }]

      const { confirm } = await inquirer.prompt(confirmQuestion) || {}
      if (confirm === false) return process.exit()
    }

    const questions = await this.getQuestions()
    const { instance } = await inquirer.prompt(questions) || {}

    const respInstanceName = instance && instance !== p(2)('Create a new one...') ? instance.trim() : null
    let instanceName = cmd.instance || respInstanceName

    if (!instanceName) {
      instanceName = await this.createNewInstance()
    }

    await this.init.addConfigFiles({ instance: instanceName }, this.session.projectPath)

    echo()
    return this.session.load()
  }

  async createNewInstance () {
    const randomName = genUniqueInstanceName()
    const { instanceName } = await inquirer.prompt([
      {
        name: 'instanceName',
        type: 'input',
        default: randomName,
        message: p(2)('Choose instance name for your project:')
      }
    ])

    const instance = await createInstance(instanceName)

    return instance.name
  }

  async getQuestions () {
    debug('getQuestions')
    const questions = []

    if (!this.cmd.instance) {
      const instances = await this.session.getInstances()
      const instancesNames = instances.map((instance) => p(2)(instance.name))
      instancesNames.unshift(p(2)('Create a new one...'))

      questions.push({
        name: 'instance',
        type: 'list',
        pageSize: 16,
        message: p(2)('Choose instance for your project:'),
        choices: instancesNames,
        default: 0
      })
    }

    return questions
  }
}

export default Attach
