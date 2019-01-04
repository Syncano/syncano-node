import format from 'chalk'
import {flags} from '@oclif/command'
import logger from '../../utils/debug'
import { echo, error } from '../../utils/print-tools'
import Hosting from '../../utils/hosting'
import Command from '../../base_command'

const { debug } = logger('cmd-hosting-sync')


export default class HostingSync extends Command {
  static description = 'List hostings'
  static flags = {
    delete: flags.boolean({char: 'd'}),
  }
  static args = [{
    name: 'hostingName',
    description: 'name of the hosting to sync (all if not provided)',
    required: true
  }]

  session: any
  Socket: any
  socket: any
  name: string


  async run () {
    debug('HostingSync.run')
    const {args} = this.parse(HostingSync)
    const {flags} = this.parse(HostingSync)

    const hostingName = args.hostingName

    const hosting = await Hosting.get(hostingName)

    if (!hosting.existLocally) {
      error(4)(`There is no "${this.name}" hosting in the project!`)
      echo()
      process.exit()
    }

    return HostingSync.syncHosting(hosting, {delete: flags.delete})
  }

  static async syncHosting (hosting: Hosting, params={}) {

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
      console.log('err', err)
      error(8)(err)
      echo()
    }
  }
}

