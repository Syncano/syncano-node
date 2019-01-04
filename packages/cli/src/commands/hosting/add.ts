import fs from 'fs'
import {flags} from '@oclif/command'
import path from 'path'
import format from 'chalk'
import inquirer from 'inquirer'
import { p, echo, error } from '../../utils/print-tools'
import HostingSync from './sync'
import Hosting from '../../utils/hosting'

import Command from '../../base_command'

export default class HostingConfig extends Command {
  static description = 'Add hosting'
  static flags = {
    name: flags.string(),
    'browser-router-on': flags.boolean(),
    'browser-router-off': flags.boolean(),
    'dont-sync': flags.boolean(),
    'sync': flags.boolean(),
    'without-cname': flags.boolean(),
    'cname': flags.string(),
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

  async run () {
    const {args} = this.parse(HostingConfig)
    const {flags} = this.parse(HostingConfig)

    this.folder = args.folder
    this.hostingName = flags.name || null
    this.browserRouter = flags['browser-router-on'] || flags['browser-router-off'] || null
    this.sync = flags['dont-sync'] ? false : (flags.sync || null)
    this.cname = flags['without-cname'] ? false : (flags.cname || null)
    this.fullPath = null

    if (!fs.existsSync(this.folder)) {
      echo()
      error(4)('Provided path doesn\'t exist.')
      echo(4)(`Type ${format.green('mkdir <folder_name>')} to create a folder.`)
      echo()
      process.exit(1)
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
      echo()
      try {
        error(4)(err.response.data.detail)
      } catch (printErr) {
        error(4)(printErr.message)
      }
      echo()
    }
  }

  async syncNewHosting (hosting) {
    if (this.sync == null) {
      const syncQuestion = [{
        type: 'confirm',
        name: 'confirm',
        message: p(2)('Do you want to sync files now?'),
        default: true
      }]

      const response = await inquirer.prompt(syncQuestion) as any
      this.sync = response.confirm || this.sync
    }

    echo()
    if (!this.sync) {
      echo(4)(`To sync files use: ${format.cyan(`npx s hosting sync ${hosting.hostingName}`)}`)
      echo()
      return process.exit()
    }

    await HostingSync.syncHosting(hosting)
  }

  getQuestions () {
    const questions = []
    if (!this.hostingName) {
      questions.push({
        name: 'name',
        message: p(2)("Set hosting's name"),
        default: 'staging',
        validate: (value) => {
          if (!value) {
            return 'This parameter is required!'
          }
          return true
        }
      })
    }

    if (this.cname == null) {
      questions.push({
        name: 'CNAME',
        message: p(2)('Set CNAME now (your own domain) or leave it empty')
      })
    }
    if (!this.browserRouter) {
      questions.push({
        type: 'confirm',
        name: 'browser_router',
        message: p(2)('Do you want to use BrowserRouter for this hosting?')
      })
    }

    return questions
  }
}

