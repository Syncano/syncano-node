import format from 'chalk'

import { echo } from '../utils/print-tools'
import Hosting from '../utils/hosting'

class HostingListCmd {
  constructor (context) {
    this.context = context
    this.session = context.session
    this.Socket = context.Socket
  }

  async run ([cmd]) {
    this.cmd = cmd

    if (cmd.socket) {
      // TODO: implement Socket-based hosting
    } else {
      return Hosting.list()
        .then((hostings) => {
          HostingListCmd.printHostings(hostings)
        })
    }
  }

  static printNoHostingsInfo () {
    echo()
    echo(4)('You don\'t have any hostings!')
    echo(4)(`Type ${format.cyan('syncano-cli hosting add')} to add hosting for your app!`)
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
    echo(4)(`${format.dim('name')}: ${format.cyan(hosting.name)}`)

    if (hosting.existRemotely) {
      echo(4)(`${format.dim('url')}: ${format.cyan(hosting.getURL())}`)
    }

    if (hosting.getCnameURL()) {
      echo(4)(`${format.dim('cname')}: ${format.cyan(cname)}`)
    }

    if (!hosting.existRemotely) {
      echo(4)(`${format.dim('status')}: ${format.red('x')}`)
    } else {
      echo(4)(`${format.dim('sync status')}: ${hosting.isUpToDate ? `${format.green('✓')}` : `${format.red('x')}`}`)
    }

    if (hosting.error) {
      const errorResponses = {
        404: `Type ${format.green(`syncano-cli hosting sync ${hosting.name}`)} to sync your hosting with server.`
      }

      echo()
      echo(4)(errorResponses[hosting.error])
    }
    echo()
  }
}

export default HostingListCmd
