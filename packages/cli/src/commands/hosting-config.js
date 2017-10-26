import format from 'chalk'
import { echo, error, warning } from '../utils/print-tools'
import Hosting from '../utils/hosting'

class HostingConfig {
  constructor (context) {
    this.context = context
    this.session = context.session
    this.Socket = context.Socket
    this.hostingName = null
    this.socket = null
  }

  async run ([hostingName, cmd]) {
    this.cname = cmd.cname
    this.fullPath = null

    Hosting.get(hostingName)
      .then((hosting) => {
        if (cmd.removeCname && !hosting.hasCNAME(cmd.removeCname)) {
          warning(4)('This hosting don\'t have such CNAME!')
          echo()
          process.exit(0)
        }
        return hosting.configure({ cname: this.cname, removeCNAME: cmd.removeCname })
      })
      .then((resp) => {
        echo(4)(format.green('Configuration successfully updated!'))
        echo()
      })
      .catch((err) => {
        try {
          error(4)(err.response.data.detail)
        } catch (printErr) {
          error(4)(printErr.message)
        }
        echo()
      })
  }
}

export default HostingConfig
