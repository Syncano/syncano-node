import {BackupClass} from '@syncano/core'
import format from 'chalk'

import Command from '../../base_command'
import {printNoBackupsInfo} from '../../commands_helpers/backups'

export default class BackupsList extends Command {
  static description = 'List backups'
  static flags = {}

  Backups: BackupClass

  async run() {
    this.session.isAuthenticated() || this.exit(1)
    this.session.hasProject() || this.exit(1)

    this.Backups = this.session.connection.backup

    this.echo()
    try {
      const backups = await this.Backups.list()
      if (backups.length) {
        backups.forEach(elem => this.printBackups(elem))
      } else {
        printNoBackupsInfo()
        this.echo()
      }
    } catch (err) {
      this.error(err.message, {exit: 1})
    }
  }

  async printBackups({id, instance, author, created_at: createAt, updated_at: updatedAt, details}) {
    this.echo(4)(`        ${format.dim('id')}: ${format.cyan.bold(id)}`)
    this.echo(4)(`  ${format.dim('instance')}: ${instance}`)
    this.echo(4)(`    ${format.dim('author')}: ${author.email}`)
    this.echo(4)(`${format.dim('created at')}: ${this.dateParser(createAt)}`)
    this.echo(4)(`${format.dim('updated at')}: ${this.dateParser(updatedAt)}`)
    this.echo(4)(`   ${format.dim('details')}:`)
    details.class && this.echo(5)(`  ${format.dim('classes')}: ${details.class.count}`)
    details.socket && this.echo(6)(` ${format.dim('sockets')}: ${details.socket.count}`)
    details.hosting && this.echo(7)(`${format.dim('hosting')}: ${details.hosting.count}`)
    this.echo()
  }

  dateParser(time: string) {
    return new Date(time).toLocaleString()
  }
}
