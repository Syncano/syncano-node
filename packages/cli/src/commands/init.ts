import {flags} from '@oclif/command'
import format from 'chalk'
import {prompt, Question} from 'inquirer'

import Command, {Init} from '../base_command'
import {createInstance} from '../commands_helpers/create-instance'
import {printInstanceInfo} from '../commands_helpers/instance'
import {Location} from '../types'
import {track} from '../utils/analytics'
import genUniqueInstanceName from '../utils/unique-instance'

export default class InitCmd extends Command {
  static description = 'Initialize Syncano project in current directory\nCreate Syncano Instance and attach it to current directory.\nSyncano config and sockets directory will also be created.'
  static flags = {
    location: flags.enum({
      options: ['eu1', 'us1'],
      char: 'l',
      description: 'Location in which instance will be created'
    }),
    template: flags.string({
      char: 't',
      description: 'Template of files structure used to init project'
    })
  }
  static examples = [
    `${format.gray('Run initialization wizard')}
  $ syncano-cli init`,
    `${format.gray('Start project with given instance name')}
  $ syncano-cli init my-instance`,
    `${format.gray('Create project in given location')}
  $ syncano-cli init my-instance -l eu1`,
    `${format.gray('Create project with given template')}
  $ syncano-cli init my-instance -t @syncano/template-project-hello`,
  ]
  static args = [{
    name: 'instance',
    description: 'Instance Name'
  }]

  async run() {
    this.session.isAuthenticated()
    const {args, flags} = this.parse(InitCmd)
    const {project, settings} = this.session
    const {instance} = args

    if (process.env.INIT_CWD) {
      track('CLI: install')
    }

    if (!settings.account.authenticated()) {
      this.echo(4)(format.red('You have to be logged in to initialize a new project!'))
      this.exit(1)
    }
    const init = new Init()
    const questions: Question[] = [
      {
        name: 'instance',
        type: 'input',
        message: this.p(2)('Choose name for your instance'),
        default: genUniqueInstanceName(),
        when: !project
      },
      {
        name: 'location',
        type: 'list',
        message: this.p(2)('Choose location for your instance'),
        choices: Init.getLocationChoices().map(choice => this.p(4)(choice)),
        default: 0,
        when: !project && !flags.location
      },
      {
        name: 'template',
        type: 'list',
        message: this.p(2)('Choose template for your project'),
        choices: Init.getTemplatesChoices().map(choice => this.p(4)(choice)),
        default: 1,
        when: !init.hasConfig() && !flags.template
      }
    ]

    if (!project) {
      this.echo()
      this.echo(4)(format.cyan('New project? Exciting! 🎉'))
      this.echo()
    } else if (!init.hasConfig()) {
      this.echo()
      this.echo(4)(`Syncano instance ${format.cyan(project.instance)} ${project.location ? format.grey(`[${project.location}]`) : ''} is attached to this folder`)
      this.echo(4)("but you don't have any config files - I'll create them for you!")
      this.echo()
    } else {
      this.echo()
      this.echo(4)('Project in this folder is already initiated:')
      this.echo()
      printInstanceInfo(this.session)
      // TODO: Should it exit with 0 or 1?
      this.exit(0)
    }

    const answers = await prompt(questions) as any
    const instanceName = answers.instance || instance

    if (answers.template) {
      init.templateName = answers.template.match(/\((.*)\)/)[1]
    }
    if (flags.template) {
      init.templateName = flags.template
    }
    if (answers.location) {
      init.locationName = answers.location.match(/[a-z0-9]+/)[0]
      await this.session.setLocation(init.locationName as Location)
    }
    if (flags.location) {
      init.locationName = flags.location
      await this.session.setLocation(init.locationName as Location)
    }

    if (!project && instanceName) {
      try {
        const newInstance = await createInstance(instanceName)
        await init.addConfigFiles({
          instance: newInstance.name,
          location: init.locationName as Location
        })
        await init.createFilesAndFolders()
        this.echo(4)(`Your project is now attached to ${format.green(newInstance.name)} instance!`)
      } catch(err) {
        console.log(err)
        this.exit(1)
      }
    }

    if (!init.hasConfig() && answers.template) {
      await init.noConfigFiles()
    }
  }
}
