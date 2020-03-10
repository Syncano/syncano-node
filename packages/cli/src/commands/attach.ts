import {flags} from '@oclif/command'
import format from 'chalk'
import inquirer, { Question } from 'inquirer'

import Command, {Init} from '../base_command'
import {createInstance} from '../commands_helpers/create-instance'
import logger from '../utils/debug'
import genUniqueInstanceName from '../utils/unique-instance'

const {debug} = logger('cmd-attach')

export default class Attach extends Command {
  static description = 'Attach Syncano Instance to current directory'
  static flags = {
    create: flags.boolean({
      char: 'c',
      description: 'Create instance if it does not exists',
    }),
    location: flags.enum({
      options: ['eu1', 'us1'],
      char: 'l',
      description: 'Location in which instance will be created',
    }),
  }
  static args = [
    {
      name: 'instance',
      description: 'Instance name'
    }
  ]
  static examples = [
    `${format.gray('Select existing Instance from list')}
  $ syncano-cli attach`,
    `${format.gray('Attach to given Instance')}
  $ syncano-cli attach INSTANCE`,
    `${format.gray('Create given Instance if it does not exists')}
  $ syncano-cli attach INSTANCE --create`,
    `${format.gray('Create given Instance if it does not exists and use given location')}
  $ syncano-cli attach INSTANCE --create --location=eu1`,
  ]

  async run() {
    this.session.isAuthenticated() || this.exit(1)

    const init = new Init()
    const {flags, args} = this.parse(Attach)

    if (this.session.project && !(flags.create || args.instance)) {
      const confirmQuestion = [{
        type: 'confirm',
        name: 'confirm',
        message: this.p(2)('This project is already attached. Are you sure you want to change instance?'),
        default: false
      } as Question]

      const {confirm = false} = await inquirer.prompt(confirmQuestion) || {}
      if (confirm === false) return this.exit(1)
    }

    let instanceName = args.instance || null
    let instance

    if (flags.create && args.instance) {
      instance = await createInstance(args.instance)
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

    await init.addConfigFiles({instance: instanceName}, this.session.getProjectPath())
    this.echo(4)(`Your project is attached to ${format.green(instanceName)} instance now!`)
    this.echo()
    this.exit(0)
  }

  async createNewInstance() {
    const randomName = genUniqueInstanceName()
    const {flags} = this.parse(Attach)
    const {instanceName, location} = await inquirer.prompt([
      {
        name: 'instanceName',
        type: 'input',
        default: randomName,
        message: this.p(2)('Choose instance name for your project:')
      },
      {
        name: 'location',
        type: 'list',
        message: this.p(2)('Choose location for your instance:'),
        choices: Init.getLocationChoices().map(choice => this.p(4)(choice)),
        default: 0,
        when: !flags.location
      }
    ])

    return createInstance(instanceName, location || flags.location)
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
      default: 0,
    })

    return questions
  }
}
