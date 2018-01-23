import logger from '../utils/debug'
import { echo, error } from '../utils/print-tools'

const { debug } = logger('cmd-instance-create')

export default class InstanceCreateCmd {
  constructor (context) {
    debug('InstanceCreateCmd.constructor')
    this.context = context
    this.session = context.session
    this.Init = context.Init
  }

  async run ([instanceName]) {
    try {
      await this.session.deleteInstance(instanceName)
      echo()
      echo(4)('Instance was deleted successfully!')
      echo()
    } catch (err) {
      error('Deleting instance failed!')
    }
  }
}
