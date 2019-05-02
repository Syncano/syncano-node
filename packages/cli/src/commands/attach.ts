import {flags} from '@oclif/command'
import format from 'chalk'
import inquirer from 'inquirer'

import Command, {Init} from '../base_command'
import {createInstance} from '../commands_helpers/create-instance'
import logger from '../utils/debug'
import genUniqueInstanceName from '../utils/unique-instance'

const {debug} = logger('cmd-attach')

export default class Attach extends Command {
  static description = 'Info about current project/instance/user etc.'
  static flags = {
    'create-instance': flags.string({
      char: 'c',
      description: 'create instance',
    }),
    instance: flags.string({
      char: 'n',
      description: 'attach to instance',
    })
  }

  async run() {
    await this.session.isAuthenticated() || this.exit(1)

    const init = new Init()
    const {flags} = this.parse(Attach)

    if (this.session.project && !(flags['create-instance'] || flags.instance)) {
      const confirmQuestion = [{
        type: 'confirm',
        name: 'confirm',
        message: this.p(2)('This project is already attached. Are you sure you want to change instance?'),
        default: false
      }]

      const {confirm = false} = await inquirer.prompt(confirmQuestion) || {}
      if (confirm === false) return this.exit(1)
    }

    let instanceName = flags.instance || null
    let instance

    if (flags['create-instance']) {
      instance = await createInstance(flags['create-instance'])
      instanceName = instance.name
    } else if (!instanceName) {
      const questions = await this.getQuestions()
      const answer = await inquirer.prompt(questions) || {} as any

      instanceName = answer.instance &&
        answer.instance !== this.p(2)('Create a new one...')
        ? answer.instance.trim() : null
    }

    if (!instanceName) {
      instance = await this.createNewInstance()
      instanceName = instance.name
    }

    await init.addConfigFiles({instance: instanceName}, this.session.projectPath)
    this.echo(4)(`Your project is attached to ${format.green(instanceName)} instance now!`)
    this.echo()
    this.exit(0)

    return this.session.load()
  }

  async createNewInstance() {
    const randomName = genUniqueInstanceName()
    const {instanceName} = await inquirer.prompt([
      {
        name: 'instanceName',
        type: 'input',
        default: randomName,
        message: this.p(2)('Choose instance name for your project:')
      }
    ])

    return createInstance(instanceName)
  }

  async getQuestions() {
    debug('getQuestions')
    const questions = []

    const instances = await this.session.getInstances()
    const instancesNames = instances.map(instance => this.p(2)(instance.name))
    instancesNames.unshift(this.p(2)('Create a new one...'))

    questions.push({
      name: 'instance',
      type: 'list',
      pageSize: 16,
      message: this.p(2)('Choose instance for your project:'),
      choices: instancesNames,
      default: 0
    })

    return questions
  }
}
