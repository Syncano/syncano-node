import format from 'chalk'

import logger from '../utils/debug'
import { echo, echon, warning } from '../utils/print-tools'

import Command from '../base_command'

const { debug } = logger('cmd-info')


export default class Info extends Command {
  static description = 'Info about current project/instance/user etc.'
  static flags = {}

  async run () {
    echo()
    echon(2)(`        ${format.dim('username')}:`)
    echo(` ${format.cyan(this.session.userEmail)}`)

    echon(2)(`       ${format.dim('full name')}:`)
    echo(` ${format.cyan(this.session.getFullName())}`)

    if (this.session.project && this.session.project.instance) {
      echon(2)(`${format.dim('current instance')}:`)
      const fromEnv = process.env.SYNCANO_PROJECT_INSTANCE
        ? ' (taken from SYNCANO_PROJECT_INSTANCE environment variable)'
        : ''
      echo(` ${format.cyan(this.session.project.instance)}`)

      if (fromEnv) {
        echo(19)(format.dim(fromEnv))
      }
    }

    const instances = await this.session.getInstances()
    if (instances.length < 1) {
      echo()
      echo(4)('You don\'t have any instances!')
      echo()
    } else {
      echo(2)(`   ${format.dim('all instances')}:`)
      instances.forEach(instance => {
        const instanceLocation = format.grey(`(${instance.location})`)
        echo(18)(`- ${format.cyan(instance.name)} ${instanceLocation}`)
      })
      echo()
    }

    if (!this.session.project) {
      warning(2)('No Syncano project in current folder!')
      echo()
    }
  }
}
