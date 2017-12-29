import format from 'chalk'
import inquirer from 'inquirer'
import { p, echo, error, warning } from '../utils/print-tools'
import Hosting from '../utils/hosting'

class HostingConfig {
  constructor (context) {
    this.context = context
    this.hosting = null
  }

  async run ([hostingName, cmd]) {
    this.cname = cmd.cname
    this.fullPath = null

    try {
      this.hosting = await Hosting.get(hostingName)

      if (!this.hosting.existLocally) {
        warning(4)('No such hosting!')
        echo()
        process.exit(1)
      }
      if (cmd.removeCname && !this.hosting.hasCNAME(cmd.removeCname)) {
        warning(4)('This hosting doesn\'t have such CNAME!')
        echo()
        process.exit(1)
      }

      let responses = {}
      if (!(cmd.removeCname || cmd.cname || cmd.browser_router)) {
        responses = await inquirer.prompt(this.getQuestions()) || {}
      }

      const paramsToUpdate = {
        cname: this.cname || responses.CNAME,
        removeCNAME: cmd.removeCname,
        browser_router: cmd.browser_router || responses.browser_router
      }

      await this.hosting.configure(paramsToUpdate)
      echo(4)(format.green('Configuration successfully updated!'))
      echo()
    } catch (err) {
      try {
        error(4)(err.response.data.detail)
      } catch (printErr) {
        error(4)(printErr.message)
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

export default HostingConfig
