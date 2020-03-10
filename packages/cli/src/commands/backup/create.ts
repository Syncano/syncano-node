import {flags} from '@oclif/command'
import {BackupClass} from '@syncano/core'
import format from 'chalk'

import Command from '../../base_command'
import {SimpleSpinner} from '../../commands_helpers/spinner'

export default class BackupsCreate extends Command {
  static description = 'Create backup'
  static flags = {
    rotate: flags.boolean({
      description: 'Remove oldest backup if limit was hit'
    })
  }
  static examples = [
    `${format.gray('Create a backup')}
  $ syncano-cli backup:create`,
    `${format.gray('Remove oldest backup if limit was hit and create a backup')}
  $ syncano-cli backup:create --rotate`,
  ]

  Backup: BackupClass
  rotateRetries = 1
  private readonly MAX_BACKUPS_MESSAGE = /Maximum number of backups per account reached/
  spinner: SimpleSpinner

  async run() {
    const {flags} = this.parse(BackupsCreate)
    this.session.isAuthenticated() || this.exit(1)
    this.session.hasProject() || this.exit(1)

    this.Backup = this.session.connection.backup

    this.spinner = new SimpleSpinner(this.p(2)('Creating backup...'))
    try {
      this.spinner.start()
      const backup = await this.Backup.create()
      const status = await this._createBackup(backup.id)
      this.spinner.stop()
      this.spinner.succeed(this.p(2)(`Backup was created (${status.id}).`))
    } catch (err) {
      this.spinner.stop()
      if (flags.rotate && this.MAX_BACKUPS_MESSAGE.test(err.message)) {
        return this.rotateBackups()
      } else {
        this.error(err.message, {exit: 1})
      }
    }
    this.exit(0)
  }

  async rotateBackups() {
    const backups = await this.Backup.list()

    if (backups.length && this.rotateRetries > 0) {
      this.rotateRetries--
      await this.Backup.delete(backups[0].id)
    } else {
      this.error('Maximum number of backups per account reached.', {exit: 1})
    }

    return this.run()
  }

  async _createBackup(id) {
    await this.timeout(3000)
    const backup = await this.Backup.find(id)

    if (backup.status !== 'success') {
      return this._createBackup(id)
    }
    return backup
  }

  timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
