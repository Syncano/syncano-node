import inquirer from 'inquirer'

import logger from '../utils/debug'
import format from 'chalk'
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

    let instanceName
    let instance

    if (cmd.createInstance) {
      instance = await createInstance(cmd.createInstance)
      instanceName = instance.name
    } else {
      const questions = await this.getQuestions()
      const answer = await inquirer.prompt(questions) || {}

      instanceName = answer.instance &&
        answer.instance !== p(2)('Create a new one...')
        ? answer.instance.trim() : null
    }

    if (!instanceName) {
      instance = await this.createNewInstance()
      instanceName = instance.name
    }

    await this.init.addConfigFiles({ instance: instanceName }, this.session.projectPath)
    echo(4)(`Your project is attached to ${format.green(instanceName)} instance now!`)
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

    return createInstance(instanceName)
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
