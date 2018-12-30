import Raven from 'raven'
import pjson from '../../package.json'
import session from './session'
import logger from './debug'

const { debug, info } = logger('utils-raven')

export default () => {
  if (process.env.NODE_ENV !== 'test') {
    info('Disabling raven alerts')
    Raven.disableConsoleAlerts()
  }

  const CLI_SENTRY_DSN = 'https://ffed6f289ae7416f84a113aba08f35c3:d1b25e9121164692b0ef4c1de84cdf02@sentry.io/135248'

  const dataCallback = (data) => {
    debug('dataCallback')
    const newData = Object.assign({}, data)
    newData.user = {
      project: session.project ? session.project.instance : null,
      host: session.getHost()
    }
    return newData
  }

  const params = {
    release: pjson.version,
    environment: process.env.NODE_ENV === 'test' ? 'staging' : 'production',
    dataCallback,
    captureUnhandledRejections: true
  }

  Raven.config(CLI_SENTRY_DSN, params).install()
}
