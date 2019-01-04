import inquirer from 'inquirer'
import format from 'chalk'
import logger from '../../utils/debug'
import { p, echo, warning, error} from '../../utils/print-tools'
import Hosting from '../../utils/hosting'

import Command from '../../base_command'

const { info, debug } = logger('cmd-hosting-list')

export default class HostingDelete extends Command {
  static description = 'Delete hosting'
  static flags = {}
  static args = [{
    name: 'hostingName',
    description: 'name of the hosting to delete',
    required: true
  }]

  async run () {
    const {args} = this.parse(HostingDelete)

    const hostingName = args.hostingName

    echo()
    const resp = await inquirer.prompt(HostingDelete.getQuestions(hostingName)) as any
    if (!resp.delete) {
      echo()
      process.exit(0)
    }

    const hosting = await Hosting.get(hostingName)
    if (!hosting.existLocally) {
      warning(p(4)(`Couldn't find any hosting named ${format.cyan(hostingName)}!`))
      echo()
      process.exit(1)
    }

    try {
      const deletedHosting = await hosting.delete()
      echo(4)(`Hosting ${format.cyan(deletedHosting.name)} has been ${format.green('successfully')} deleted!`)
      echo()
    } catch (err) {
      error('Deleting hosting failed!')
    }
  }
  static getQuestions (hostingName:string ) {
    const questions = [
      {
        type: 'confirm',
        name: 'delete',
        message: p(2)(`Are you sure you want to remove: ${format.red(hostingName)}`),
        default: false
      }
    ]

    return questions
  }
}
