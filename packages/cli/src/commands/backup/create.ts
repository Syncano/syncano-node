import {BackupClass} from '@syncano/core/backup'

import Command from '../../base_command'
import {SimpleSpinner} from '../../commands_helpers/spinner'

export default class BackupsCreate extends Command {
  static description = 'Create backup'
  static flags = {}

  Backup: BackupClass

  async run() {
    await this.session.isAuthenticated() || this.exit(1)
    await this.session.hasProject() || this.exit(1)

    this.Backup = this.session.connection.backup

    const spinner = new SimpleSpinner(this.p(2)('Creating backup...'))
    try {
      spinner.start()
      const backup = await this.Backup.create()
      const status = await this._createBackup(backup.id)
      spinner.stop()
      spinner.succeed(this.p(2)(`Backup was created (${status.id}).`))
    } catch (err) {
      this.error(err.message)
      this.exit(1)
    }

    this.exit(0)
  }

  async _createBackup(id) {
    await this.timeout(3000)
    const backup = await this.Backup.get(id)

    if (backup.status !== 'success') {
      return this._createBackup(id)
    }

    return backup
  }

  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
