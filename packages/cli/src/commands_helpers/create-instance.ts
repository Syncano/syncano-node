import format from 'chalk'

import logger from '../utils/debug'
import {echo, echon, error} from '../utils/print-tools'
import session from '../utils/session'

const {debug} = logger('cmd-helpers-create-instance')

export const createInstance = async (instanceName?: string, location?: 'eu1' | 'us1') => {
  let newInstance = null
  try {
    debug('Creating Instance')
    echo()
    echon(4)('Creating Syncano Instance... ')
    newInstance = await session.createInstance(instanceName, location)
    echo(`${format.green('Done')}`)
    echo(4)(`Syncano Instance ${format.cyan(newInstance.name)} has been created!`)
    echo()
    return newInstance
  } catch (err) {
    debug(err)
    echo()
    echo()
    if (err.message === 'No such API Key.') {
      error(4)('It looks like your account key is invalid.')
      echo(4)(`Try ${format.cyan('npx s logout')} and ${format.cyan('npx s login')} again.`)
    } else if (err.message === 'name: This field must be unique.') {
      error(4)('Instance already exist!')
      echo(4)('Try another instance name.')
    } else {
      error(4)(err.message || 'Error while creating instance. Try again!')
    }
    echo()
    throw new Error('Error while creating instance.')
  }
}
