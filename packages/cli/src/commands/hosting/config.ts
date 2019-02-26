import {flags} from '@oclif/command'
import format from 'chalk'
import inquirer from 'inquirer'

import Command from '../../base_command'
import Hosting from '../../utils/hosting'

import HostingListCmd from './list'

export default class HostingConfig extends Command {
  static description = 'Configure hosting'
  static flags = {
    cname: flags.string({char: 'c'}),
    'browser-router': flags.boolean({allowNo: true}),
    'dont-sync': flags.boolean(),
    sync: flags.boolean(),
    'remove-cname': flags.string(),
  }
  static args = [{
    name: 'hostingName',
    description: 'name of the hosting to list files from',
    required: true
  }]

  hosting: any
  cname: string
  fullPath: string
  removeCname: string
  browserRouter: boolean

  async run() {
    await this.session.isAuthenticated()
    await this.session.hasProject()
    const {args} = this.parse(HostingConfig)
    const {flags} = this.parse(HostingConfig)

    const hostingName = args.hostingName

    this.cname = flags.cname
    this.removeCname = flags['remove-cname']
    this.browserRouter = flags['browser-router']
    this.fullPath = null

    try {
      this.hosting = await Hosting.get(hostingName)

      this.echo()
      if (!this.hosting.existLocally) {
        this.warn(this.p(4)('No such hosting!'))
        this.echo()
        this.exit(1)
      }
      if (this.removeCname && !this.hosting.hasCNAME(this.removeCname)) {
        this.warn(this.p(4)('This hosting doesn\'t have such CNAME!'))
        this.echo()
        this.exit(1)
      }

      let responses = {} as any
      if (!(this.removeCname || this.cname || this.browserRouter)) {
        responses = await inquirer.prompt(this.getQuestions()) || {}
      }

      const paramsToUpdate = {
        cname: this.cname || responses.CNAME,
        removeCNAME: this.removeCname,
        browser_router: responses.browser_router ? responses.browser_router : this.browserRouter
      }

      await this.hosting.configure(paramsToUpdate)

      this.echo(4)(format.green('Configuration successfully updated!'))
      this.echo()
      HostingListCmd.printHosting(this.hosting)
      this.echo()
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        this.error(this.p(4)(err.response.data.detail))
      } else {
        this.error(this.p(4)(err.message))
      }
      this.echo()
    }
  }

  getQuestions() {
    const questions = []

    if (!this.cname) {
      questions.push({
        name: 'CNAME',
        message: this.p(2)('Set CNAME now (your own domain) or leave it empty'),
        default: this.hosting.getCNAME()
      })
    }
    if (!this.browserRouter) {
      questions.push({
        type: 'confirm',
        name: 'browser_router',
        message: this.p(2)('Do you want to use BrowserRouter for this hosting?'),
        default: this.hosting.config.browser_router
      })
    }

    return questions
  }
}
