import {flags} from '@oclif/command'
import {BackupClass} from '@syncano/core'

import Command from '../../base_command'
import {SimpleSpinner} from '../../commands_helpers/spinner'

export default class BackupDelete extends Command {
  static description = 'Delete backup'
  static flags = {
    all: flags.boolean({
      description: 'Remove all backup'
    })
  }
  static args = [{
    name: 'id',
    description: 'Backup ID.'
  }]

  Backups: BackupClass

  async run() {
    this.session.isAuthenticated() || this.exit(1)
    this.session.hasProject() || this.exit(1)

    this.Backups = this.session.connection.backup

    const {args} = this.parse(BackupDelete)
    const {flags} = this.parse(BackupDelete)

    try {
      this.echo()
      if (flags.all) {
        const spinner = new SimpleSpinner(this.p(2)('Deleting Backups...')).start()
        await this.Backups.delete()
        spinner.stop()
        spinner.succeed(this.p(2)('All backups deleted.'))
        this.echo()
      } else if (!args.id) {
        this.echo(4)('Please provide backup id.')
      } else {
        await this.Backups.delete(args.id)
        this.echo(4)('Backup deleted.')
        this.echo()
      }
    } catch (err) {
      this.echo()
      this.error(err.message, {exit: 1})
    }
    this.exit(0)
  }
}
