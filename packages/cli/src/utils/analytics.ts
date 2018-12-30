/* eslint no-underscore-dangle: "warn" */
import _ from 'lodash'
import Analytics from 'analytics-node'
import Command from 'commander'

import pjson from '../../package.json'
import logger from './debug'
import session from './session'

const { debug } = logger('utils-analytics')

const STG_KEY = 'CCupheBjgV6WI0emy3oRUnDyjQ8ngmgB'
const PROD_KEY = 'fLDtpYXRjFYnHlp1gvzl4I3Gv8gDoQ8m'

const ANALYTICS_WRITE_KEY = process.env.SYNCANO_ENV === 'test' ? STG_KEY : PROD_KEY
const analytics = new Analytics(ANALYTICS_WRITE_KEY, {flushAt: 1})

const identify = (details: any) => {
  debug('identify')
  analytics.identify({
    userId: details.id,
    traits: {
      'First name': details.first_name,
      'Last name': details.last_name,
      source: 'Sign up',
      email: details.email,
      is_active: details.is_active
    }
  })
  analytics.alias({
    previousId: details.email,
    userId: details.id
  })
}

interface TrackParams {
  properties: any
  event: string
  userId?: string | number
  instance?: string
}
interface TrackPops {
  version: string
  instance?: string
}

const track = (eventName: string, params = {}) => {
  debug('track')

  const props = Object.assign({
    version: pjson.version
  } as TrackPops, params)

  if (session.project) {
    props.instance = session.project.instance
  }

  const trackParams = {
    properties: props,
    event: eventName
  } as TrackParams

  if (session.userId) {
    trackParams.userId = session.userId
    analytics.track(trackParams)
  }
}

const trackCommand = (options, additionalParams = {}) => {
  debug('trackCommand')
  const cmd = _.find(options, (option) => option instanceof Command.Command)
  debug('trackCommand parent', cmd.parent._name) // eslint-disable-line
  const parent = cmd.parent._name === 'cli' ? null : cmd.parent._name.split('-').slice(-1)[0] // eslint-disable-line

  const props = Object.assign({
    version: cmd.parent.version(),
    args: cmd.parent.rawArgs.slice(2).join(' '),
    group: cmd._group, // eslint-disable-line
    type: 'command'
  }, additionalParams)

  let eventName = `CLI command: ${cmd.name()}`
  if (parent) {
    eventName = `CLI command: ${parent} ${cmd.name()}`
  }

  track(eventName, props)
}

export {
  identify,
  track,
  trackCommand
}
