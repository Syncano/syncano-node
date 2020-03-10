import format from 'chalk'

import Command from '../../base_command'

export default class BackupsCreate extends Command {
  static description = 'Manage account backups'
  static examples = [
    `${format.gray('Create a backup')}
  $ syncano-cli backup:create`,
    `${format.gray('Remove oldest backup if limit was hit and create a backup')}
  $ syncano-cli backup:create --rotate`,
    `${format.gray('Remove backup by id')}
  $ syncano-cli backup:delete [ID]`,
    `${format.gray('Remove all backups')}
  $ syncano-cli backup:delete --all`,
  ]

  async run() {
    // This file is used to provide a proper description and examples
  }
}
