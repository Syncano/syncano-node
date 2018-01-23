import logger from '../utils/debug'
import { createInstance } from './helpers/create-instance'

const { debug } = logger('cmd-instance-create')

export default class InstanceCreateCmd {
  constructor (context) {
    debug('InstanceCreateCmd.constructor')
    this.context = context
    this.session = context.session
    this.Init = context.Init
  }

  async run ([instanceName]) {
    return createInstance(instanceName, this.session)
  }
}
