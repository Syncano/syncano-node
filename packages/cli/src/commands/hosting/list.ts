import format from 'chalk'
import logger from '../../utils/debug'
import { echo, echon } from '../../utils/print-tools'
import Hosting from '../../utils/hosting'

import Command from '../../base_command'

const { info, debug } = logger('cmd-hosting-list')

export default class HostingListCmd extends Command {
  static description = 'List hostings'
  static flags = {}
  static args = []

  async run () {
    const hostings = await Hosting.list()
    HostingListCmd.printHostings(hostings)
  }

  static printNoHostingsInfo () {
    echo()
    echo(4)('You don\'t have any hostings!')
    echo(4)(`Type ${format.cyan('npx s hosting add')} to add hosting for your app!`)
    echo()
  }

  static printHostings (hostings = []) {
    if (!hostings.length) {
      HostingListCmd.printNoHostingsInfo()
      process.exit(0)
    }
    echo()
    echo(4)('Your hostings:')
    echo()
    hostings.forEach(HostingListCmd.printHosting.bind(this))
  }

  static printHosting (hosting) {
    const cname = typeof hosting.getCnameURL === 'function' && hosting.getCnameURL()
    echo(11)(`${format.dim('name')}: ${format.cyan(hosting.name)}`)

    echon(2)(`   ${format.dim('local path')}:`)
    echo(` ${format.cyan(hosting.src)}`)

    if (hosting.existRemotely) {
      echo(12)(`${format.dim('URL')}: ${format.cyan(hosting.getURL())}`)
    }

    if (hosting.getCnameURL()) {
      echo(10)(`${format.dim('CNAME')}: ${format.cyan(cname)}`)
    }

    echon(2)(`${format.dim('BrowserRouter')}:`)
    echo(` ${format.cyan(hosting.config.browser_router ? format.green('✓') : format.red('x'))}`)

    if (!hosting.existRemotely) {
      echo(9)(`${format.dim('status')}: ${format.magenta('not synced')}`)
    } else {
      echo(4)(`${format.dim('sync status')}: ${hosting.isUpToDate ? `${format.green('✓')}` : `${format.red('x')}`}`)
    }

    if (hosting.error) {
      const errorResponses = {
        404: `Type ${format.green(`npx s hosting sync ${hosting.name}`)} to sync your hosting with server.`
      }

      echo()
      echo(4)(errorResponses[hosting.error])
    }
    echo()
  }
}

