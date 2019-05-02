import {BackupClass} from '@syncano/core/backup'
import format from 'chalk'

import Command from '../../base_command'
import {printNoBackupsInfo} from '../../commands_helpers/backups'

export default class BackupsLast extends Command {
  static description = 'List last backup'
  static flags = {}

  Backup: BackupClass

  async run() {
    await this.session.isAuthenticated() || this.exit(1)
    await this.session.hasProject() || this.exit(1)

    this.Backup = this.session.connection.backup

    try {
      const backup = await this.Backup.last()

      this.echo()
      if (!backup) {
        printNoBackupsInfo()
        this.echo()

        return this.exit(1)
      }

      const {id, instance, author, created_at: createAt, updated_at: updatedAt, details} = backup

      this.echo(4)(`        ${format.dim('id')}: ${format.cyan.bold(`${id}`)}`)
      this.echo(4)(`  ${format.dim('instance')}: ${instance}`)
      this.echo(4)(`    ${format.dim('author')}: ${author.email}`)
      this.echo(4)(`${format.dim('created at')}: ${this.dateParser(createAt)}`)
      this.echo(4)(`${format.dim('updated at')}: ${this.dateParser(updatedAt)}`)
      this.echo(4)(`   ${format.dim('details')}:`)
      this.echo(8)(`  ${format.dim('class')}: ${details.class ? details.class.count : 0}`)
      this.echo(8)(` ${format.dim('socket')}: ${details.socket ? details.socket.count : 0}`)
      this.echo(8)(`${format.dim('hosting')}: ${details.hosting ? details.hosting.count : 0}`)
      this.echo()

      return this.exit(0)
    } catch (err) {
      this.error(err.message)

      return this.exit(1)
    }
  }

  dateParser(time) {
    return `${time.substring(0, 9)} ${time.substring(11, 19)}`
  }
}
