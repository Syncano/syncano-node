import format from 'chalk'
import process from 'process'
import inquirer from 'inquirer'
import validator from 'validator'

import logger from '../utils/debug'
import { track } from '../utils/analytics'
import { echo, p } from '../utils/print-tools'

const { debug } = logger('cmd-login')

export default class Login {
  constructor (context) {
    debug('Login.constructor')
    this.context = context
    this.session = context.session
  }

  static displayWelcomeMessage (user) {
    echo()
    echo(4)(`Welcome back ${format.cyan(user.email)}. You're already logged in!`)
    echo()
  }

  static displayLoginMessage () {
    echo()
    echo(4)(`Welcome to ${format.cyan('Syncano')} (${format.dim('syncano.io')})`)
    echo(4)('Please login or create an account by entering your email and password:')
    echo()
  }

  static displayNewAccountMessage () {
    echo()
    echo(4)(`${format.green('New account has been created!')}`)
    echo()
  }

  run ([cmd]) {
    return this.session.checkAuth()
      .then((user) => Login.displayWelcomeMessage(user))
      .catch((err) => this.promptLogin())
  }

  loginCallback (resp, loginType) {
    this.session.settings.account.set('auth_key', resp.account_key)
    this.session.load()
      .then(() => {
        if (loginType === 'signup') {
          track('CLI: Sign up')
        } else {
          track('CLI: Sign in')
        }
        echo()
        echo(4)(`${format.green('You\'re in! Enjoy!')} 👍`)
        echo()
      })
  }

  register ({ email, password }) {
    return this.session.getAnonymousConnection().Account
      .register({ email, password })
      .then((resp) => {
        Login.displayNewAccountMessage()
        return this.loginCallback(resp, 'signup')
      })
      .catch((registerErr) => {
        echo(`Register error: ${registerErr.message}`)
        process.exit()
      })
  }

  loginOrRegister ({ email, password }) {
    debug('Registering/Logging in', email)
    return this.session.connection.Account
      .login({ email, password })
      .then((resp) => this.loginCallback(resp))
      .catch(async (loginErr) => {
        if (loginErr.message === 'Invalid email.') {
          debug('Login failed, trying to register')
          await Login.promptCreation()
          return this.register({ email, password })
        }
        echo(4)('Authentication error! 😢')
        echo()
        echo(4)(loginErr.message)
      })
  }

  static async promptCreation () {
    debug('Login.promptCreation()')

    const confirmQuestion = [{
      type: 'confirm',
      name: 'confirm',
      message: p(8)('This email doesn\'t exists. Do you want to create new account?'),
      default: false
    }]

    const { confirm } = await inquirer.prompt(confirmQuestion) || {}
    if (confirm === false) return process.exit()
  }

  promptLogin () {
    debug('Login.promptLogin()')

    const loginQuestion = {
      name: 'email',
      message: p(8)('Your e-mail'),
      validate: (value) => validator.isEmail(value) || 'E-mail is required!'
    }

    const passwordQuestion = {
      name: 'password',
      message: p(8)('Password'),
      type: 'password',
      validate: (value) => validator.isLength(value, { min: 5 }) || 'Password must contain at least 5 characters.'
    }

    Login.displayLoginMessage()

    return inquirer.prompt([loginQuestion, passwordQuestion])
      .then((resp) => this.loginOrRegister(resp))
  }
}
