import fs from 'fs'
import path from 'path'
import format from 'chalk'
import inquirer from 'inquirer'
import { p, echo, error } from '../utils/print-tools'
import HostingSync from './hosting-sync'
import Hosting from '../utils/hosting'

class HostingAdd {
  context: any
  session: any
  Socket: any
  socket: any
  hostingName: any
  folder: string
  cname: string
  fullPath: string
  browserRouter: boolean
  sync: boolean

  constructor (context: any) {
    this.context = context
    this.session = context.session
    this.Socket = context.Socket
    this.hostingName = null
  }

  async run ([folder, cmd]: any[]) {
    this.folder = folder
    this.hostingName = cmd.hostingName || null
    this.browserRouter = cmd.browserRouterOn || cmd.browserRouterOff || null
    this.sync = cmd.dontSync ? false : (cmd.sync || null)
    this.cname = cmd.withoutCname ? false : (cmd.cname || null)
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
      await Hosting.add(params)
      await this.syncNewHosting()
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

  async syncNewHosting () {
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
      echo(4)(`To sync files use: ${format.cyan(`npx s hosting sync ${this.hostingName}`)}`)
      echo()
      return process.exit()
    }

    new HostingSync(this.context).run([this.hostingName, { socket: this.socket ? this.socket.name : null }])
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

export default HostingAdd
