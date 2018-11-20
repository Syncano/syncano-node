import format from 'chalk'
import { printNoBackupsInfo } from './helpers/backups'
import { echo, error } from '../utils/print-tools'

class BackupsList {
  constructor (context) {
    this.session = context.session
    this.Backups = context.session.connection.backups
  }

  async run () {
    try {
      const backup = await this.Backups.list()
      if (backup.length) {
        backup.forEach(elem => this.printBackups(elem))
      } else {
        printNoBackupsInfo()
        echo()
      }
    } catch (err) {
      error(err.message)
      process.exit(1)
    }
  }

  async printBackups ({id, instance, author, created_at: createAt, updated_at: updatedAt, details}) {
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
  }

  dateParser (time) {
    return `${time.substring(0,9)} ${time.substring(11, 19)}`
  }
}

export default BackupsList
