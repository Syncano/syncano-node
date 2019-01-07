import format from 'chalk'
import logger from '../../utils/debug'
import { printNoBackupsInfo } from '../../commands_helpers/backups'
import { echo, error } from '../../utils/print-tools'

import Command from '../../base_command'

const { debug } = logger('cmd-info')


export default class BackupsLast extends Command {
  static description = 'List last backup'
  static flags = {}

  Backups: any

  async run () {
    await this.session.isAuthenticated()
    await this.session.hasProject()

    this.Backups = this.session.connection.backups
    try {
      const backup = await this.Backups.last()

      echo()
      if (!backup) {
        printNoBackupsInfo()
        echo()
        process.exit(1)
      }

      const {id, instance, author, created_at: createAt, updated_at: updatedAt, details} = backup

      echo(4)(`        ${format.dim('id')}: ${format.cyan.bold(id)}`)
      echo(4)(`  ${format.dim('instance')}: ${instance}`)
      echo(4)(`    ${format.dim('author')}: ${author.email}`)
      echo(4)(`${format.dim('created at')}: ${this.dateParser(createAt)}`)
      echo(4)(`${format.dim('updated at')}: ${this.dateParser(updatedAt)}`)
      echo(4)(`   ${format.dim('details')}:`)
      echo(8)(`  ${format.dim('class')}: ${details.class.count}`)
      echo(8)(` ${format.dim('socket')}: ${details.socket.count}`)
      echo(8)(`${format.dim('hosting')}: ${details.hosting.count}`)
      echo()
    } catch (err) {
      error(err.message)
      process.exit(1)
    }
  }

  dateParser (time) {
    return `${time.substring(0, 9)} ${time.substring(11, 19)}`
  }
}

