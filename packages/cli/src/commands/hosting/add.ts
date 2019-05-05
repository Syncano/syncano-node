import {flags} from '@oclif/command'
import format from 'chalk'
import fs from 'fs'
import inquirer from 'inquirer'
import path from 'path'

import Command from '../../base_command'
import Hosting from '../../utils/hosting'

import HostingSync from './sync'

export default class HostingConfig extends Command {
  static description = 'Add hosting'
  static flags = {
    name: flags.string(),
    'browser-router-on': flags.boolean(),
    'browser-router-off': flags.boolean(),
    'dont-sync': flags.boolean(),
    sync: flags.boolean(),
    'without-cname': flags.boolean(),
    cname: flags.string(),
  }
  static args = [{
    name: 'folder',
    description: 'path to hosting folder',
    required: true
  }]

  socket: any
  hostingName: any
  folder: string
  cname: string | boolean
  fullPath: string
  browserRouter: boolean
  sync: boolean

  async run() {
    await this.session.isAuthenticated()
    await this.session.hasProject()
    const {args} = this.parse(HostingConfig)
    const {flags} = this.parse(HostingConfig)

    this.folder = args.folder
    this.hostingName = flags.name || null
    this.browserRouter = flags['browser-router-on'] || flags['browser-router-off'] || null
    this.sync = flags['dont-sync'] ? false : (flags.sync || null)
    this.cname = flags['without-cname'] ? false : (flags.cname || null)
    this.fullPath = null

    if (!fs.existsSync(this.folder)) {
      this.echo()
      this.echo(4)(this.p('Provided path doesn\'t exist.'))
      this.echo(4)(`Type ${format.green('mkdir <folder_name>')} to create a folder.`)
      this.echo()
      this.exit(1)
    }

    const responses = await inquirer.prompt(this.getQuestions()) || {} as any

    if (!this.hostingName) {
      this.hostingName = responses.name
    }

    const params = {
      name: this.hostingName,
      browser_router: responses.browser_router || this.browserRouter,
      src: path.relative(this.session.projectPath, path.join(process.cwd(), this.folder)),
      cname: responses.CNAME || this.cname
    }

    try {
      const hosting = await Hosting.add(params)
      await this.syncNewHosting(hosting)
    } catch (err) {
      this.echo()
      if (err.response && err.response.data && err.response.data.detail) {
        this.error(this.p(4)(err.response.data.detail))
      } else {
        this.error(this.p(4)(err.message))
      }
      this.echo()
      this.exit(1)
    }
    this.exit(0)
  }

  async syncNewHosting(hosting) {
    if (this.sync === null) {
      const syncQuestion = [{
        type: 'confirm',
        name: 'confirm',
        message: this.p(2)('Do you want to sync files now?'),
        default: true
      }]

      const response = await inquirer.prompt(syncQuestion) as any
      this.sync = response.confirm || this.sync
    }

    this.echo()
    if (!this.sync) {
      this.echo(4)(`To sync files use: ${format.cyan(`npx s hosting:sync ${hosting.name}`)}`)
      this.echo()
    } else {
      await HostingSync.syncHosting(hosting)
    }
  }

  getQuestions() {
    const questions = []
    if (!this.hostingName) {
      questions.push({
        name: 'name',
        message: this.p(2)("Set hosting's name"),
        default: 'staging',
        validate: value => {
          if (!value) {
            return 'This parameter is required!'
          }
          return true
        }
      })
    }

    if (this.cname === null) {
      questions.push({
        name: 'CNAME',
        message: this.p(2)('Set CNAME now (your own domain) or leave it empty')
      })
    }
    if (!this.browserRouter) {
      questions.push({
        type: 'confirm',
        name: 'browser_router',
        message: this.p(2)('Do you want to use BrowserRouter for this hosting?')
      })
    }

    return questions
  }
}
