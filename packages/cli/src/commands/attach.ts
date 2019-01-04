import inquirer from 'inquirer'

import logger from '../utils/debug'
import format from 'chalk'
import { p, echo } from '../utils/print-tools'
import genUniqueInstanceName from '../utils/unique-instance'
import { createInstance } from '../commands_helpers/create-instance'

import Command, {Init} from '../base_command'
import { flags } from '@oclif/command';


const { debug } = logger('cmd-attach')

export default class Attach extends Command {
  static description = 'Info about current project/instance/user etc.'
  static flags = {
    'create-instance': flags.string(),
    instance: flags.string()
  }

  async run () {
    const init = new Init()

    const {args} = this.parse(Attach)
    const {flags} = this.parse(Attach)

    if (this.session.project) {
      const confirmQuestion = [{
        type: 'confirm',
        name: 'confirm',
        message: p(2)('This project is already attached. Are you sure you want to change instance?'),
        default: false
      }]

      const { confirm = false } = await inquirer.prompt(confirmQuestion) || {}
      if (confirm === false) return process.exit()
    }

    let instanceName
    let instance

    if (flags['create-instance']) {
      instance = await createInstance(flags['create-instance'])
      instanceName = instance.name
    } else {
      const questions = await this.getQuestions()
      const answer = await inquirer.prompt(questions) || {} as any

      instanceName = answer.instance &&
        answer.instance !== p(2)('Create a new one...')
        ? answer.instance.trim() : null
    }

    if (!instanceName) {
      instance = await this.createNewInstance()
      instanceName = instance.name
    }

    await init.addConfigFiles({ instance: instanceName }, this.session.projectPath)
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

    return questions
  }
}
