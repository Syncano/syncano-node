import Command from '@oclif/command'

import Init from './utils/init'
import {echo, echon, p} from './utils/print-tools'
import session, {Session} from './utils/session'
import Socket from './utils/sockets'

export {
  Socket,
  Init,
}

export default abstract class extends Command {
  session: Session
  echo: any
  echon: any
  p: any

  async init() {
    this.session = session
    await this.session.load()

    this.echo = echo
    this.echon = echon
    this.p = p
  }
}
