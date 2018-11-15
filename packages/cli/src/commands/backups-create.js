import { SimpleSpinner } from './helpers/spinner'
import { p, echo, error } from '../utils/print-tools'

class BackupsCreate {
  constructor (context) {
    this.session = context.session
    this.Backups = context.session.connection.backups
  }

  async run () {
    echo()
    try {
      const spinner = new SimpleSpinner(p(2)('Creating Backup...')).start()
      const backup = await this.Backups.create()
      await this._createBackup(backup.id)
      spinner.stop()
      spinner.succeed(p(2)(`Your backup was created`))
      echo()
    } catch (err) {
      error(err.message)
      process.exit(1)
    }
  }

  async _createBackup (id) {
    const backup = await this.Backups.get(id)

    if (backup.status !== 'success') {
      await this._createBackup(id)
    }
  }
}

export default BackupsCreate
