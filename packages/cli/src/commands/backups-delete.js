import { SimpleSpinner } from './helpers/spinner'
import { p, echo, error } from '../utils/print-tools'

class BackupsDelete {
  constructor (context) {
    this.session = context.session
    this.Backups = context.session.connection.backups
  }

  async run ([option]) {
    try {
      if (option === 'all') {
        const spinner = new SimpleSpinner(p(2)('Deleting Backups...')).start()
        await this.Backups.deleteAll()
        spinner.stop()
        spinner.succeed(p(2)(`Backups deleted`))
        echo()
      } else {
        await this.Backups.delete(option)
        echo(4)(`Backup deleted`)
        echo()
      }
    } catch (err) {
      echo()
      error(err.message)
      process.exit(1)
    }
  }
}

export default BackupsDelete
