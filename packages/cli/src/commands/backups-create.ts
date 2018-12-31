import { SimpleSpinner } from './helpers/spinner'
import { p, echo, error } from '../utils/print-tools'

class BackupsCreate {
  session: any
  Backups: any

  constructor (context) {
    this.session = context.session
    this.Backups = context.session.connection.backups
  }

  async run ([]: any[]) {
    try {
      const spinner = new SimpleSpinner(p(2)('Creating backup...')).start()
      const backup = await this.Backups.create()
      await this._createBackup(backup.id)
      spinner.stop()
      spinner.succeed(p(2)(`Backup was created.`))
      echo()
    } catch (err) {
      echo()
      error(err.message)
      process.exit(1)
    }
  }

  async _createBackup (id) {
    await this.timeout(3000)
    const backup = await this.Backups.get(id)

    if (backup.status !== 'success') {
      await this._createBackup(id)
    }
  }

  timeout (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default BackupsCreate
