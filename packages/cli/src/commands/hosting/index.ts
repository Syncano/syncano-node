import format from 'chalk'

import Command from '../../base_command'

export default class Hosting extends Command {
  static description = 'Manage static Syncano hostings'
  static examples = [
    `${format.gray('Create a hosting')}
  $ syncano-cli hosting:add ./path/to/public`,
    `${format.gray('Create a hosting with CNAME')}
  $ syncano-cli hosting:add ./path/to/public --cname my-domain.com`,
    `${format.gray('Create a hosting with given name')}
  $ syncano-cli hosting:add ./path/to/public --name staging`,
    `${format.gray('Change hosting CNAME')}
  $ syncano-cli hosting:config staging --cname staging.my-domain.com`,
  ]

  async run() {
    // This file is used to provide a proper description and examples
  }
}
