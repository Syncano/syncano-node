import format from 'chalk'
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
        this.printNoBackupsInfo()
      }
      echo()
    } catch (err) {
      error(err.message)
      process.exit(1)
    }
  }

  printNoBackupsInfo () {
    echo()
    echo(4)('You don\'t have any backups!')
    echo(4)(`Type ${format.cyan('npx s backups create')} to add backups for your app!`)
    echo()
  }

  async printBackups ({id, instance, author, created_at, updated_at, details}) {
    echo(4)(`        ${format.dim('id')}: ${format.cyan.bold(id)}`)
    echo(4)(`  ${format.dim('instance')}: ${instance}`)
    echo(4)(`    ${format.dim('author')}: ${author.email}`)
    echo(4)(`${format.dim('created at')}: ${this.dateParser(created_at)}`)
    echo(4)(`${format.dim('updated at')}: ${this.dateParser(updated_at)}`)
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
