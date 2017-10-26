import inquirer from 'inquirer'
import format from 'chalk'
import Hosting from '../utils/hosting'

import { echo, p, warning, error } from '../utils/print-tools'

export default class HostingDelete {
  constructor (context) {
    this.context = context
    this.session = context.session
    this.Socket = context.Socket
    this.Hosting = context.Hosting
  }

  static getQuestions (hostingName) {
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

  async run ([hostingName, cmd]) {
    this.cmd = cmd
    if (cmd.socket) {
      // TODO: impement Socket level hosting
    } else {
      return inquirer.prompt(HostingDelete.getQuestions(hostingName))
      .then((resp) => {
        if (!resp.delete) {
          echo()
          process.exit(0)
        }
        return Hosting.get(hostingName)
          .then((hosting) => {
            if (!hosting.existLocally) {
              warning(p(4)(`Couldn't find any hosting named ${format.cyan(hostingName)}!`))
              echo()
              process.exit(1)
            }
            return hosting.delete()
          })
          .then((deletedHosting) => {
            echo(4)(`Hosting ${format.cyan(deletedHosting.name)} has been ${format.green('successfully')} deleted!`)
            echo()
          })
          .catch(() => {
            error('Deleting hosting failed!')
          })
      })
    }
  }
}
