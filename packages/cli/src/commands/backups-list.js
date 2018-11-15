import format from 'chalk'
import { echo, error } from '../utils/print-tools'

class BackupsList {
  constructor (context) {
    this.session = context.session
    this.Backups = context.session.connection.backups
    console.log("ok")
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
    echo(4)(`${format.dim('id')}: ${format.cyan.bold(id)}`)
    echo(4)(`${format.dim('instance')}: ${instance}`)
    echo(4)(`${format.dim('author')}: ${author.email}`)
    echo(4)(`${format.dim('created at')}: ${created_at}`)
    echo(4)(`${format.dim('updated at')}: ${updated_at}`)
    echo(4)(`${format.dim('details')}:`)
    echo(8)(`${format.dim('class')}: ${details.class.count}`)
    echo(8)(`${format.dim('socket')}: ${details.socket.count}`)
    echo(8)(`${format.dim('hosting')}: ${details.hosting.count}`)
    echo()
  }
}

export default BackupsList
