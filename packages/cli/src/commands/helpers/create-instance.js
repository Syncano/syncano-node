import format from 'chalk'

import logger from '../../utils/debug'
import session from '../../utils/session'
import { echo, echon, error } from '../../utils/print-tools'

const { debug } = logger('cmd-helpers-socket')

export const createInstance = async (instanceName) => {
  let newInstance = null
  try {
    debug('Creating Instance')
    echo()
    echon(4)('Creating Syncano Instance... ')
    newInstance = await session.createInstance(instanceName)
  } catch (err) {
    debug(err)
    echo()
    echo()
    if (err.message === 'No such API Key.') {
      error(4)('It looks like your account key is invalid.')
      echo(4)(`Try ${format.cyan('syncano-cli logout')} and ${format.cyan('syncano-cli login')} again.`)
    } else if (err.message === 'name: This field must be unique.') {
      error(4)('Instance already exist!')
      echo(4)('Try another instace name.')
    } else {
      error(4)(err.message || 'Error while creating instance. Try again!')
    }
    echo()
    process.exit(1)
  } finally {
    echo(`${format.green('Done')}`)
    echo(4)(`Syncano Instance ${format.cyan(newInstance.name)} has been created!`)
    echo()
  }
  return newInstance
}
