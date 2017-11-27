import format from 'chalk'
import { echo, error, warning } from '../utils/print-tools'
import Hosting from '../utils/hosting'

class HostingConfig {
  constructor (context) {
    this.context = context
  }

  async run ([hostingName, cmd]) {
    this.cname = cmd.cname
    this.fullPath = null

    try {
      const hosting = await Hosting.get(hostingName)
      if (cmd.removeCname && !hosting.hasCNAME(cmd.removeCname)) {
        warning(4)('This hosting doesn\'t have such CNAME!')
        echo()
        process.exit(0)
      }

      await hosting.configure({ cname: this.cname, removeCNAME: cmd.removeCname })
      echo(4)(format.green('Configuration successfully updated!'))
      echo()
    } catch (err) {
      try {
        error(4)(err.response.data.detail)
      } catch (printErr) {
        error(4)(printErr.message)
      }
      echo()
    }
  }
}

export default HostingConfig
