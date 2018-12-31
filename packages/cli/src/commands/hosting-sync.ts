import format from 'chalk'

import logger from '../utils/debug'
import { echo, error } from '../utils/print-tools'
import Hosting from '../utils/hosting'

const { debug } = logger('cmd-hosting-sync')

class HostingSync {
  context: any
  session: any
  Socket: any
  socket: any
  name: string

  constructor (context) {
    debug('HostingSync.constructor')
    this.context = context
    this.session = context.session
    this.Socket = context.Socket
  }

  async run ([hostingName, cmd]: any[]) {
    debug(`HostingSync.run ${hostingName}`)
    this.name = hostingName
    if (!hostingName || typeof hostingName !== 'string') return error('Hosting name is a required parameter!')

    let hosting = null
    hosting = await Hosting.get(hostingName)

    if (!hosting.existLocally) {
      if (this.socket) {
        error(4)(`There is no "${this.name}" hosting in the "${this.socket.name}" socket!`)
      } else {
        error(4)(`There is no "${this.name}" hosting in the project!`)
      }
      echo()
      process.exit()
    }

    return this.syncHosting(hosting, {delete: cmd.delete})
  }

  async syncHosting (hosting, params) {
    debug(`Syncing ${hosting.name} (${this.session.project.instance})`)

    if (!hosting.name) return
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
}

export default HostingSync
