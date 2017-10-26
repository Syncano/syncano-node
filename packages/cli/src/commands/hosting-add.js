import fs from 'fs'
import path from 'path'
import format from 'chalk'
import inquirer from 'inquirer'
import { p, echo, error } from '../utils/print-tools'
import HostingSync from './hosting-sync'
import Hosting from '../utils/hosting'

class HostingAdd {
  constructor (context) {
    this.context = context
    this.session = context.session
    this.Socket = context.Socket
    this.hostingName = null
    this.socket = null
  }

  async run ([folder, cmd]) {
    this.folder = folder
    this.socketName = cmd.socket
    this.cname = cmd.cname
    this.fullPath = null

    if (!fs.existsSync(this.folder)) {
      echo()
      error(4)('Provided path doesn\'t exist.')
      echo(4)(`Type ${format.green('mkdir <folder_name>')} to create a folder.`)
      echo()
      process.exit(1)
    }

    const responses = await inquirer.prompt(this.getQuestions()) || {}

    this.hostingName = responses.name

    if (this.socketName) {
      // TODO: implement Socket level hosting
      const params = {
      }
      this.socket = await this.Socket.get(cmd.socket || responses.socket)
      this.socket.addHosting(this.hostingName, params)
    } else {
      const params = {
        name: this.hostingName,
        src: path.relative(this.session.projectPath, path.join(process.cwd(), this.folder)),
        cname: this.cname || responses.CNAME || null
      }
      Hosting.add(params)
        .then((resp) => this.syncNewHosting())
        .catch((err) => {
          echo()
          try {
            error(4)(err.response.data.detail)
          } catch (printErr) {
            error(4)(printErr.message)
          }
          echo()
        })
    }
  }

  async syncNewHosting () {
    const syncQuestion = [{
      type: 'confirm',
      name: 'confirm',
      message: p(2)('Do you want to sync files now?'),
      default: false
    }]

    const response = await inquirer.prompt(syncQuestion)
    echo()

    if (!response.confirm) {
      echo(4)(`To sync files use: ${format.cyan(`syncano-cli hosting sync ${this.hostingName}`)}`)
      echo()
      return process.exit()
    }

    new HostingSync(this.context).run([this.hostingName, { socket: this.socket ? this.socket.name : null }])
  }

  getQuestions () {
    const questions = [{
      name: 'name',
      message: p(2)("Set hosting's name"),
      default: 'staging',
      validate: (value) => {
        if (!value) {
          return 'This parameter is required!'
        }
        return true
      }
    }]

    if (!this.cname) {
      questions.push({
        name: 'CNAME',
        message: p(2)('Set CNAME now (your own domain) or leave it empty')
      })
    }

    return questions
  }
}

export default HostingAdd
