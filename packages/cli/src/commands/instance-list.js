import logger from '../utils/debug'
import { echo } from '../utils/print-tools'

const { debug } = logger('cmd-instance-list')

export default class InstanceCreateCmd {
  constructor (context) {
    debug('InstanceCreateCmd.constructor')
    this.context = context
    this.session = context.session
    this.Init = context.Init
  }

  async run ([cmd]) {
    const instances = await this.session.getInstances()
    if (instances.length < 1) {
      echo()
      echo(4)('You don\'t have any instances!')
      echo()
    } else {
      echo()
      echo(4)('Instances:')
      instances.forEach(instance => {
        echo(6)(`- ${instance.name}`)
      })
      echo()
    }
  }
}
