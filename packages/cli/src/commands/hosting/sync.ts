import {flags} from '@oclif/command'
import BluebirdPromise from 'bluebird'
import format from 'chalk'

import Command from '../../base_command'
import logger from '../../utils/debug'
import Hosting from '../../utils/hosting'
import {echo, error} from '../../utils/print-tools'

const {debug} = logger('cmd-hosting-sync')

export default class HostingSync extends Command {
  static description = 'List hostings'
  static flags = {
    delete: flags.boolean({char: 'd'}),
  }
  static args = [{
    name: 'hostingName',
    description: 'name of the hosting to sync (all if not provided)',
    required: false
  }]

  static async syncHosting(hosting: Hosting, params= {}) {
    debug(`Syncing ${hosting.name}`)

    if (!hosting.name) return
    echo()
    echo(8)(`Syncing hosting files for ${format.cyan(hosting.name)}`)
    echo(8)(`${format.dim(hosting.getURL())}`)
    echo()

    try {
      const output = await hosting.syncFiles(params)
      echo(output)
    } catch (err) {
      error(8)(err)
      echo()
    }
  }

  session: any
  Socket: any
  socket: any
  name: string

  async run() {
    debug('HostingSync.run')
    await this.session.isAuthenticated()
    await this.session.hasProject()
    const {args} = this.parse(HostingSync)
    const {flags} = this.parse(HostingSync)

    const hostingName = args.hostingName

    try {
      if (hostingName) {
        const hosting = await Hosting.get(hostingName)

        if (!hosting.existLocally) {
          error(4)(`There is no "${hostingName}" hosting in the project!`)
          echo()
        } else {
          await HostingSync.syncHosting(hosting, {delete: flags.delete})
        }
      } else {
        const hostings = await Hosting.list()
        await BluebirdPromise.each(hostings, async (hosting) =>
          HostingSync.syncHosting(hosting, {delete: flags.delete})
        )
      }
    } catch {
      error(4)(`Error while syncing!`)
      this.exit(1)
    } finally {
      this.exit()
    }
  }
}
