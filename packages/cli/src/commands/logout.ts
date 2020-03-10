import format from 'chalk'

import Command from '../base_command'

export default class Logout extends Command {
  static description = 'Log out'
  static flags = {}

  run() {
    const authenticated = this.session.settings.account.authenticated()

    if (!authenticated) {
      this.echo()
      this.echo(4)(`${format.red('You are not logged in!')}`)
      this.echo()
      return this.exit(1)
    }

    this.echo()
    this.echo(4)(`${format.green('You have been logged out!')}`)
    this.echo()

    this.session.settings.account.logout()
    return this.exit(0)
  }
}
