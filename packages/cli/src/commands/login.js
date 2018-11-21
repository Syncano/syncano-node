import format from 'chalk'
import process from 'process'
import inquirer from 'inquirer'
import validator from 'validator'

import logger from '../utils/debug'
import { track } from '../utils/analytics'
import { echo, p, error} from '../utils/print-tools'

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

  async run ([cmd]) {
    try {
      const user = await this.session.checkAuth()
      await Login.displayWelcomeMessage(user)
    } catch (err) {
      await this.promptLogin()
    }
  }

  async loginCallback (resp, loginType) {
    this.session.settings.account.set('auth_key', resp.account_key)
    await this.session.load()

    if (loginType === 'signup') {
      track('CLI: Sign up')
    } else {
      track('CLI: Sign in')
    }
    echo()
    echo(4)(`${format.green('You\'re in! Enjoy!')} 👍`)
    echo()
  }

  async register ({ email, password }) {
    try {
      const account = await this.session.getAnonymousConnection().account.register({ email, password })
      Login.displayNewAccountMessage()
      return this.loginCallback(account, 'signup')
    } catch (err) {
      echo()
      error(4)(err.message)
      echo()
      process.exit()
    }
  }

  async loginOrRegister ({ email, password }) {
    debug('Registering/Logging in', email)
    try {
      const account = await this.session.connection.account.login({ email, password })
      return this.loginCallback(account)
    } catch (err) {
      if (err.message === 'Invalid email.') {
        debug('Login failed, trying to register')
        await Login.promptCreation()
        return this.register({ email, password })
      }
      echo()
      echo(4)(`😢  ${format.red(err.message)}`)
      echo()
    }
  }

  async promptLogin () {
    debug('promptLogin')
    Login.displayLoginMessage()

    const responses = await inquirer.prompt([Login.loginQuestion, Login.passwordQuestion])
    await this.loginOrRegister(responses)
  }
}

Login.loginQuestion = {
  name: 'email',
  message: p(8)('Your e-mail'),
  validate: (value) => validator.isEmail(value) || 'E-mail is required!'
}

Login.passwordQuestion = {
  name: 'password',
  message: p(8)('Password'),
  type: 'password',
  validate: (value) => validator.isLength(value, { min: 5 }) || 'Password must contain at least 5 characters.'
}
