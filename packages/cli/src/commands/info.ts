import format from 'chalk'

import Command from '../base_command'

export default class Info extends Command {
  static description = 'Info about current project/instance/user etc.'
  static flags = {}

  async run() {
    if (!this.session.isAuthenticated()) {
      this.exit(1)
    }

    this.echo()
    this.echon(2)(`        ${format.dim('username')}:`)
    this.echo(` ${format.cyan(this.session.getUserEmail() || '')}`)

    this.echon(2)(`       ${format.dim('full name')}:`)
    this.echo(` ${format.cyan(this.session.getFullName())}`)

    if (this.session.project && this.session.project.instance) {
      this.echon(2)(`${format.dim('current instance')}:`)
      const fromEnv = process.env.SYNCANO_PROJECT_INSTANCE
        ? ' (taken from SYNCANO_PROJECT_INSTANCE environment variable)'
        : ''
      this.echo(` ${format.cyan(this.session.project.instance)}`)

      if (fromEnv) {
        this.echo(19)(format.dim(fromEnv))
      }
    }

    const instances = await this.session.getInstances()
    if (instances.length < 1) {
      this.echo()
      this.echo(4)('You don\'t have any instances!')
      this.echo()
    } else {
      this.echo(2)(`   ${format.dim('all instances')}:`)
      instances.forEach(instance => {
        const instanceLocation = format.grey(`(${instance.location})`)
        this.echo(18)(`- ${format.cyan(instance.name)} ${instanceLocation}`)
      })
      this.echo()
    }

    if (!this.session.project) {
      this.warn(this.p(2)('No Syncano project in current folder!'))
      this.echo()
    }
    this.exit(0)
  }
}
