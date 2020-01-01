import {flags} from '@oclif/command'
import format from 'chalk'
import {prompt, Question} from 'inquirer'
import validator from 'validator'
import { AccountOwner } from '@syncano/core';
import { LoginData } from '@syncano/core';

import Command from '../base_command'
import {track} from '../utils/analytics'
import logger from '../utils/debug'


const {debug} = logger('cmd-login')

type LoginType = 'signup'

type EmailAndPassword = {
  email: string;
  password: string;
}

export default class Login extends Command {
  static description = 'Login to your account'
  static flags = {
    email: flags.string({
      char: 'e',
      description: 'account email',
    }),
    password: flags.string({
      char: 'p',
      description: 'account password',
    }),
  }

  loginQuestion = (): Question => ({
    name: 'email',
    message: this.p(8)('Your e-mail'),
    validate: (value: string) => validator.isEmail(value) || 'E-mail is required!'
  })

  passwordQuestion = (): Question => ({
    name: 'password',
    message: this.p(8)('Password'),
    type: 'password',
    validate: (value: string) => validator.isLength(value, {min: 5}) || 'Password must contain at least 5 characters.'
  })

  displayWelcomeMessage(user: AccountOwner) {
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

    const confirmQuestion: Question[] = [{
      type: 'confirm',
      name: 'confirm',
      message: this.p(8)('This email doesn\'t exists. Do you want to create new account?'),
      default: false
    }]

    const {confirm = false} = await prompt(confirmQuestion) || {}
    if (confirm === false) return this.exit(1)
  }

  async run() {
    const {flags} = this.parse(Login)

    try {
      const user = await this.session.checkAuth()
      await this.displayWelcomeMessage(user)
    } catch (err) {
      if (flags && flags.email && flags.password) {
        await this.loginOrRegister(flags as EmailAndPassword)
      } else {
        await this.promptLogin()
      }
    }
  }

  async loginCallback(resp: LoginData, loginType?: LoginType) {
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
    this.exit(0)
  }

  async register({email, password}: EmailAndPassword) {
    try {
      const account = await this.session.getAnonymousConnection().account.register({email, password})
      this.displayNewAccountMessage()
      return this.loginCallback(account, 'signup' as LoginType)
    } catch (err) {
      this.echo()
      this.error(this.p(4)(err.message))
      this.echo()
      this.exit(1)
    }
  }

  async loginOrRegister({email, password}: EmailAndPassword) {
    debug('Registering/Logging in', email)
    try {
      const account = await this.session.getConnection().account.login({email, password})
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

    const responses = await prompt([this.loginQuestion(), this.passwordQuestion()]) as any
    await this.loginOrRegister(responses)
  }
}
