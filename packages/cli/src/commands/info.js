import format from 'chalk'

import logger from '../utils/debug'
import { echo, echon, warning } from '../utils/print-tools'

const { debug } = logger('cmd-info')

export default class InfoCmd {
  constructor (context) {
    debug('InfoCmd.constructor')
    this.context = context
    this.session = context.session
    this.Init = context.Init
  }

  async run ([cmd]) {
    echo()
    echon(2)(`        ${format.dim('username')}:`)
    echo(` ${format.cyan(this.session.userEmail)}`)

    echon(2)(`       ${format.dim('full name')}:`)
    echo(` ${format.cyan(this.session.getFullName())}`)

    if (this.session.project && this.session.project.instance) {
      echon(2)(`${format.dim('current instance')}:`)
      echo(` ${format.cyan(this.session.project.instance)}`)
    }
    echon(2)(`         ${format.dim('api url')}:`)
    echo(` ${format.cyan(this.session.HOST)}`)

    const instances = await this.session.getInstances()
    if (instances.length < 1) {
      echo()
      echo(4)('You don\'t have any instances!')
      echo()
    } else {
      echo(2)(`   ${format.dim('all instances')}:`)
      instances.forEach(instance => {
        echo(18)(`- ${format.cyan(instance.name)}`)
      })
      echo()
    }

    if (!this.session.project) {
      warning(2)('No Syncano project in current folder!')
      echo()
    }
  }
}
