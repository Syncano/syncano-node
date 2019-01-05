import Command, {flags} from '@oclif/command'
import session from './utils/session'
import {Session} from './utils/session'
import Socket from './utils/sockets'
import Init from './utils/init'

export {
  Socket,
  Init,
}

export default abstract class extends Command {
  session: Session

  async init() {
    this.session = session
    await this.session.load()
  }
  // static flags = {
  //   loglevel: flags.string({options: ['error', 'warn', 'info', 'debug']})
  // }

  // log(msg, level) {
  //   switch (this.flags.loglevel) {
  //   case 'error':
  //     if (level === 'error') console.error(msg)
  //     break
  //   // a complete example would need to have all the levels
  //   }
  // }

  // async init(err) {
  //   // do some initialization
  //   const {flags} = this.parse(this.constructor)
  //   this.flags = flags
  // }
  // async catch(err) {
  //   // handle any error from the command
  // }
  // async finally(err) {
  //   // called after run and catch regardless of whether or not the command errored
  // }
}
