import format from 'chalk'

import Command from '../../base_command'
import {printNoBackupsInfo} from '../../commands_helpers/backups'

export default class BackupsList extends Command {
  static description = 'List backups'
  static flags = {}

  Backups: any

  async run() {
    await this.session.isAuthenticated() || this.exit(1)
    await this.session.hasProject() || this.exit(1)

    this.Backups = this.session.connection.backups

    this.echo()
    try {
      const backup = await this.Backups.list()
      if (backup.length) {
        backup.forEach(elem => this.printBackups(elem))
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
    this.echo(8)(`  ${format.dim('class')}: ${details.class.count}`)
    this.echo(8)(` ${format.dim('socket')}: ${details.socket.count}`)
    this.echo(8)(`${format.dim('hosting')}: ${details.hosting.count}`)
    this.echo()
  }

  dateParser(time: string) {
    return new Date(time).toLocaleString()
  }
}
