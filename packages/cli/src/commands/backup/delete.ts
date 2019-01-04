import format from 'chalk'
import logger from '../../utils/debug'
import { SimpleSpinner } from '../../commands_helpers/spinner'
import { p, echo, error } from '../../utils/print-tools'

import Command from '../../base_command'
import { flags } from '@oclif/command';

const { debug } = logger('cmd-info')


export default class BackupDelete extends Command {
  static description = 'Delete backup'
  static flags = {
    'all': flags.boolean()
  }
  static args = [{
    name: 'id',
    description: 'Backup ID.'
  }]

  Backups: any

  async run () {
    this.Backups = this.session.connection.backups

    const {args} = this.parse(BackupDelete)
    const {flags} = this.parse(BackupDelete)

    try {
      echo()
      if (flags.all) {
        const spinner = new SimpleSpinner(p(2)('Deleting Backups...')).start()
        await this.Backups.deleteAll()
        spinner.stop()
        spinner.succeed(p(2)(`All backups deleted.`))
        echo()
      } else if (!args.id) {
        echo(4)(`Please provide backup id.`)
      } else {
        await this.Backups.delete(args.id)
        echo(4)(`Backup deleted.`)
        echo()
      }
    } catch (err) {
      echo()
      error(err.message)
      process.exit(1)
    }
  }
}

