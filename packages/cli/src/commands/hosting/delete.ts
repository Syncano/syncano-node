import {flags} from '@oclif/command'
import format from 'chalk'
import inquirer from 'inquirer'

import Command from '../../base_command'
import Hosting from '../../utils/hosting'

export default class HostingDelete extends Command {
  static description = 'Delete hosting'
  static flags = {
    confirm: flags.boolean({
      char: 'c',
      description: 'confirms deletion of a hosting'
    })
  }
  static args = [{
    name: 'hostingName',
    description: 'name of the hosting to delete',
    required: true
  }]

  getQuestions(hostingName: string) {
    const questions = [
      {
        type: 'confirm',
        name: 'delete',
        message: this.p(2)(`Are you sure you want to remove: ${format.red(hostingName)}`),
        default: false
      }
    ]

    return questions
  }

  async run() {
    await this.session.isAuthenticated() || this.exit(1)
    await this.session.hasProject() || this.exit(1)
    const {args, flags} = this.parse(HostingDelete)
    const hostingName = args.hostingName
    const hosting = await Hosting.get(hostingName)

    if (!hosting || hosting && !hosting.existLocally) {
      this.echo(this.p(4)(`Couldn't find any hosting named ${format.cyan(hostingName)}!`))
      this.echo()
      this.exit(1)
    }

    this.echo()
    if (!flags.confirm) {
      const resp = await inquirer.prompt(this.getQuestions(hostingName)) as any
      if (!resp.delete) {
        this.echo()
        this.exit(0)
      }
    }

    try {
      const deletedHosting = await hosting.delete()
      this.echo(4)(`Hosting ${format.cyan(deletedHosting.name)} has been ${format.green('successfully')} deleted!`)
      this.echo()
    } catch (err) {
      this.error('Deleting hosting failed!')
    }
  }
}
