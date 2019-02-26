import format from 'chalk'
import inquirer from 'inquirer'
import validator from 'validator'

import Command from '../base_command'
import {track} from '../utils/analytics'
import logger from '../utils/debug'

const {debug} = logger('cmd-login')

export default class Login extends Command {
  static description = 'Login to your account'
  static flags = {}

  loginQuestion = () => ({
    name: 'email',
    message: this.p(8)('Your e-mail'),
    validate: value => validator.isEmail(value) || 'E-mail is required!'
  })

  passwordQuestion = () => ({
    name: 'password',
    message: this.p(8)('Password'),
    type: 'password',
    validate: value => validator.isLength(value, {min: 5}) || 'Password must contain at least 5 characters.'
  })

  displayWelcomeMessage(user) {
    this.echo()
    this.echo(4)(`Welcome back ${format.cyan(user.email)}. You're already logged in!`)
    this.echo()
  }

  displayLoginMessage() {
    this.echo()
    this.echo(4)(`Welcome to ${format.cyan('Syncano')} (${format.dim('syncano.io')})`)
    this.echo(4)('Please login or create an account by entering your email and password:')
    this.echo()
  }

  displayNewAccountMessage() {
    this.echo()
    this.echo(4)(`${format.green('New account has been created!')}`)
    this.echo()
  }

  async promptCreation() {
    debug('Login.promptCreation()')

    const confirmQuestion = [{
      type: 'confirm',
      name: 'confirm',
      message: this.p(8)('This email doesn\'t exists. Do you want to create new account?'),
      default: false
    }]

    const {confirm = false} = await inquirer.prompt(confirmQuestion) || {}
    if (confirm === false) return this.exit()
  }

  async run() {
    try {
      const user = await this.session.checkAuth()
      await this.displayWelcomeMessage(user)
    } catch (err) {
      await this.promptLogin()
    }
  }

  async loginCallback(resp, loginType?) {
    this.session.settings.account.set('auth_key', resp.account_key)
    await this.session.load()

    if (loginType === 'signup') {
      track('CLI: Sign up')
    } else {
      track('CLI: Sign in')
    }
    this.echo()
    this.echo(4)(`${format.green('You\'re in! Enjoy!')} 👍`)
    this.echo()
  }

  async register({email, password}) {
    try {
      const account = await this.session.getAnonymousConnection().account.register({email, password})
      this.displayNewAccountMessage()
      return this.loginCallback(account, 'signup')
    } catch (err) {
      this.echo()
      this.error(this.p(4)(err.message))
      this.echo()
      this.exit()
    }
  }

  async loginOrRegister({email, password}) {
    debug('Registering/Logging in', email)
    try {
      const account = await this.session.connection.account.login({email, password})
      return this.loginCallback(account)
    } catch (err) {
      if (err.message === 'Invalid email.') {
        debug('Login failed, trying to register')
        await this.promptCreation()
        return this.register({email, password})
      }
      this.echo()
      this.echo(4)(`😢  ${format.red(err.message)}`)
      this.echo()
      this.exit(1)
    }
  }

  async promptLogin() {
    debug('promptLogin')
    this.displayLoginMessage()

    const responses = await inquirer.prompt([this.loginQuestion(), this.passwordQuestion()]) as any
    await this.loginOrRegister(responses)
  }
}
