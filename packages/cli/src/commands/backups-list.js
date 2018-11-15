import format from 'chalk'
import { echo, error } from '../utils/print-tools'

class BackupsList {
  constructor (context) {
    this.session = context.session
    this.Backups = context.session.connection.backups
  }

  async run () {
    echo()
    try {
      const backup = await this.Backups.list()
      backup.forEach(elem => this.printBackups(elem))
      echo()
    } catch (err) {
      error(err.message)
      process.exit(1)
    }
  }

  async printBackups ({id, instance, author, created_at, updated_at, details}) {
    echo(12)(`${format.dim('id')}: ${format.cyan.bold(id)}`)
    echo(6)(`${format.dim('instance')}: ${instance}`)
    echo(8)(`${format.dim('author')}: ${author.email}`)
    echo(4)(`${format.dim('created at')}: ${this.dateParser(created_at)}`)
    echo(4)(`${format.dim('updated at')}: ${this.dateParser(updated_at)}`)
    echo(7)(`${format.dim('details')}:`)
    echo(14)(`${format.dim('class')}: ${details.class.count}`)
    echo(13)(`${format.dim('socket')}: ${details.socket.count}`)
    echo(12)(`${format.dim('hosting')}: ${details.hosting.count}`)
    echo()
  }

  dateParser (time) {
    return `${time.substring(0,9)} ${time.substring(11, 19)}`
  }
}

export default BackupsList
