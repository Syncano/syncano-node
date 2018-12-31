import Raven from 'raven'
import format from 'chalk'
import _ from 'lodash'
import { error, echo } from './print-tools'
import { CLIContext, CLISession } from '../types';
import session from './session';

// TODO: how solve this with typescript?
// process.noDeprecation = true

process.on('unhandledRejection', (reason, p) => {
  if (reason.name === 'RequestError' && reason.status === 403) {
    if (reason.errors.detail === 'No such API Key.') {
      const errorMessage =
        `API key from your config file is not valid. Use ${format.cyan('npx s login')} to log in once again.`
      echo(errorMessage)
      echo()
      return
    }
  }

  const message = `Unhandled Rejection! ${reason}`
  const fileIssue = 'Please file an issue here:\nhttps://github.com/Syncano/syncano-node/issues'
  error(message, fileIssue)
  if (process.env.NODE_ENV === 'test' || process.env.CLI_SHOW_STACK) {
    console.log(reason.stack)
  }
})

class ErrorResponse {
  context: CLIContext
  session: CLISession
  name: string
  contextName: string

  constructor (context) {
    this.context = context
    this.name = context.name
    this.contextName = context.constructor.name.toLowerCase()
    this.session = this.context.session || null
  }
  static checkErrorType (err) {
    if (err.name === 'RequestError') return 'requestError'
    if (err.errno < 0) return 'systemError'

    return 'default'
  }
  static handleRequestError (err, name, contextName) {
    if (err.status === 404) {
      const errorMessage = `"${name}" ${contextName} could not be found on your remote Syncano account!`

      const url = _.has(err, 'response.request.url')
        ? `We've tried reaching the following url: ${err.response.request.url}` : null

      error(err, errorMessage, url)
      echo()
      echo(`Did you run ${format.green('npx s deploy')} command?`)
      return
    }
    error(err)
  }

  static handleSystemError (err, name, contextName) {
    if (err.code === 'ENOENT') {
      error('File or directory not found at:', err.path)
      return
    }
    error(err)
  }

  captureException (err) {
    const context = this.context
    const session = context.session

    if (session) {
      const account = session.settings.account
      delete account.attributes.auth_key
      Raven.setContext({ user: { session, account } })
    } else {
      Raven.setContext({ user: { context } })
    }

    Raven.captureException(err)
  }

  handle (err) {
    const name = this.name
    const contextName = this.contextName
    const errorType = ErrorResponse.checkErrorType(err)

    this.captureException(err)
    const handleError = {
      requestError: () => ErrorResponse.handleRequestError(err, name, contextName),
      systemError: () => ErrorResponse.handleSystemError(err, name, contextName),
      default: () => error(err)
    }

    return handleError[errorType]()
  }
}

export default ErrorResponse
