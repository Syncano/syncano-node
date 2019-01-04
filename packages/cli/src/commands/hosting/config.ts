import _ from 'lodash'
import inquirer from 'inquirer'
import {flags} from '@oclif/command'
import format from 'chalk'
import { p, echo, error, warning } from '../../utils/print-tools'
import Hosting from '../../utils/hosting'
import HostingListCmd from './list'

import Command from '../../base_command'

export default class HostingConfig extends Command {
  static description = 'Configure hosting'
  static flags = {
    cname: flags.string({char: 'c'}),
    removeCname: flags.string(),
    browserRouter: flags.boolean(),
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
  browser_router: boolean
  browserRouter: boolean

  static toggleBrowserRouter (command, responses) {
    if (responses.browser_router) {
      return responses.browser_router
    }
    return command === 'true'
  }

  async run () {
    const {args} = this.parse(HostingConfig)
    const {flags} = this.parse(HostingConfig)

    const hostingName = args.hostingName
    
    this.cname = flags.cname
    this.removeCname = flags.removeCname
    this.browserRouter = flags.browserRouter
    this.fullPath = null

    try {
      this.hosting = await Hosting.get(hostingName)

      if (!this.hosting.existLocally) {
        warning(4)('No such hosting!')
        echo()
        process.exit(1)
      }
      if (this.removeCname && !this.hosting.hasCNAME(this.removeCname)) {
        warning(4)('This hosting doesn\'t have such CNAME!')
        echo()
        process.exit(1)
      }

      let responses = {} as any
      if (!(this.removeCname || this.cname || this.browserRouter)) {
        responses = await inquirer.prompt(this.getQuestions()) || {}
      }

      const paramsToUpdate = {
        cname: this.cname || responses.CNAME,
        removeCNAME: this.removeCname,
        browser_router: HostingConfig.toggleBrowserRouter(this.browserRouter, responses)
      }

      await this.hosting.configure(paramsToUpdate)

      echo()
      echo(4)(format.green('Configuration successfully updated!'))
      echo()
      HostingListCmd.printHosting(this.hosting)
      echo()
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        error(4)(err.response.data.detail)
      } else {
        error(4)(err.message)
      }
      echo()
    }
  }

  getQuestions () {
    const questions = []

    if (!this.cname) {
      questions.push({
        name: 'CNAME',
        message: p(2)('Set CNAME now (your own domain) or leave it empty'),
        default: this.hosting.getCNAME()
      })
    }
    if (!this.browser_router) {
      questions.push({
        type: 'confirm',
        name: 'browser_router',
        message: p(2)('Do you want to use BrowserRouter for this hosting?'),
        default: this.hosting.config.browser_router
      })
    }

    return questions
  }
}

