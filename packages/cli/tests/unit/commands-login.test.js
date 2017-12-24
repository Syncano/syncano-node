/* global it describe before after afterEach beforeEach */
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import format from 'chalk'
import inquirer from 'inquirer'

import { getRandomString } from '@syncano/test-tools'

import { Login } from '../../src/commands'
import context from '../../src/utils/context'
import session from '../../src/utils/session'
import printTools from '../../src/utils/print-tools'

sinon.test = sinonTestFactory(sinon)

describe('[commands] Login', function () {
  const email = process.env.E2E_CLI_EMAIL
  const login = new Login(context)
  let response = {}
  let error = {}
  let interEcho = null
  let echo = null
  let loginCallback = null
  let loadSession = null

  beforeEach(function () {
    interEcho = sinon.stub()
    echo = sinon.stub(printTools, 'echo').callsFake((content) => interEcho)
    loadSession = sinon.stub(login.session, 'load').returns(Promise.resolve())
  })

  afterEach(function () {
    interEcho.reset()
    login.session.load.restore()
    printTools.echo.restore()
  })

  describe('run', function () {
    let displayWelcomeMessage = null
    let promptLogin = null

    beforeEach(function () {
      displayWelcomeMessage = sinon.stub(Login, 'displayWelcomeMessage')
      promptLogin = sinon.stub(login, 'promptLogin')
    })

    afterEach(function () {
      Login.displayWelcomeMessage.restore()
      login.promptLogin.restore()
    })

    it('should render welcome message when logged in', sinon.test(async function () {
      response = {
        user: { email }
      }

      this.stub(session, 'checkAuth').returns(Promise.resolve(response))

      await login.run([{}])

      sinon.assert.calledWith(displayWelcomeMessage, response)
    }))

    it('should return prompt login on error', sinon.test(async function () {
      this.stub(session, 'checkAuth').returns(Promise.reject(new Error('error')))

      await login.run([{}])

      sinon.assert.called(promptLogin)
    }))
  })

  describe('loginCallback', function () {
    let set = null
    const accountKey = getRandomString('login_accountKey[0]')

    beforeEach(function () {
      set = sinon.stub(login.session.settings.account, 'set')
    })

    afterEach(function () {
      login.session.settings.account.set.restore()
    })

    it('should print login callback message with proper padding and set the account key', async function () {
      const loginMessage = `${format.green('You\'re in! Enjoy!')} 👍`

      await login.loginCallback({ account_key: accountKey })

      sinon.assert.calledWith(echo, 4)
      sinon.assert.calledWith(interEcho, loginMessage)
    })

    it('should set the account key', async function () {
      await login.loginCallback({ account_key: accountKey })
      sinon.assert.calledWith(set, 'auth_key', accountKey)
    })

    it('should reload session', async function () {
      await login.loginCallback({ account_key: accountKey })

      sinon.assert.calledOnce(loadSession)
    })
  })

  describe('register', function () {
    let newAccountMessage = null

    beforeEach(function () {
      loginCallback = sinon.stub(login, 'loginCallback')
      newAccountMessage = sinon.stub(Login, 'displayNewAccountMessage')
      sinon.stub(process, 'exit')
    })

    afterEach(function () {
      login.loginCallback.restore()
      Login.displayNewAccountMessage.restore()
      process.exit.restore()
    })

    it.skip('should call newAccountMessage and loginCallback', sinon.test(async function () {
      response = {
        account_key: getRandomString('login_register_response_account_key')
      }

      this.stub(session.connection.account, 'register').returns(Promise.resolve(response))

      await login.register({})

      sinon.assert.calledWith(loginCallback, response)
      sinon.assert.called(newAccountMessage)
    }))

    it.skip('should print Register error', sinon.test(async function () {
      error = {
        message: getRandomString('login_register_error_message')
      }

      this.stub(session.connection.account, 'register').returns(Promise.reject(error))

      await login.register({})

      sinon.assert.calledWith(echo, `Register error: ${error.message}`)
      sinon.assert.called(process.exit)
    }))
  })

  describe('loginOrRegister', function () {
    let register = null

    before(function () {
      loginCallback = sinon.stub(login, 'loginCallback')
      register = sinon.stub(login, 'register')
      sinon.stub(Login, 'promptCreation')
    })

    after(function () {
      login.loginCallback.restore()
      login.register.restore()
      Login.promptCreation.restore()
    })

    it('should return loginCallback', sinon.test(async function () {
      response = {
        account_key: getRandomString('login_loginOrRegister_response_account_key')
      }

      this.stub(session.connection.account, 'login').returns(Promise.resolve(response))

      await login.loginOrRegister({})

      sinon.assert.calledWith(loginCallback, response)
    }))

    it('should redirect to register', sinon.test(async function () {
      const credentials = {
        email: getRandomString('login_loginOrRegister_credentials_email'),
        password: getRandomString('login_loginOrRegister_credentials_password')
      }
      error = {
        message: 'Invalid email.'
      }

      this.stub(session.connection.account, 'login').returns(Promise.reject(error))

      await login.loginOrRegister(credentials)

      sinon.assert.calledWith(register, credentials)
    }))

    it('should print error message with proper padding', sinon.test(async function () {
      error = {
        message: getRandomString('login_loginOrRegister_error_message')
      }
      const errorMessages = [`😢  ${format.red(error.message)}`]

      this.stub(session.connection.account, 'login').returns(Promise.reject(error))

      await login.loginOrRegister({})

      sinon.assert.calledWith(echo, 4)
      sinon.assert.calledWith(interEcho, errorMessages[0])
    }))
  })

  describe('displayWelcomeMessage', function () {
    const user = { email }

    it('with user parameter and proper padding', function () {
      Login.displayWelcomeMessage(user)

      sinon.assert.calledWith(echo, 4)
      sinon.assert.calledWith(interEcho, `Welcome back ${format.cyan(user.email)}. You're already logged in!`)
    })
  })

  describe('displayLoginMessage', function () {
    const welcomeMessage = `Welcome to ${format.cyan('Syncano')} (${format.dim('syncano.io')})`
    const requestMessage = 'Please login or create an account by entering your email and password:'

    it('render welcome message with propper padding', function () {
      Login.displayLoginMessage()

      sinon.assert.calledWith(echo, 4)
      sinon.assert.calledWith(interEcho, welcomeMessage)
    })

    it('render login request message', function () {
      Login.displayLoginMessage()

      sinon.assert.calledWith(echo, 4)
      sinon.assert.calledWith(interEcho, requestMessage)
    })
  })

  describe('displayNewAccountMessage', function () {
    it('render welcome message with propper padding', function () {
      Login.displayNewAccountMessage()

      sinon.assert.calledWith(echo, 4)
      sinon.assert.calledWith(interEcho, `${format.green('New account has been created!')}`)
    })
  })

  describe('promptLogin', function () {
    let loginOrRegister = null

    before(function () {
      sinon.stub(Login, 'displayLoginMessage')
      loginOrRegister = sinon.stub(login, 'loginOrRegister')
    })

    after(function () {
      Login.displayLoginMessage.restore()
      login.loginOrRegister.restore()
    })

    it('with params', sinon.test(async function () {
      const res = {
        email,
        password: getRandomString('login_prompt_res_password')
      }

      this.stub(inquirer, 'prompt').returns(Promise.resolve(res))

      await login.promptLogin()

      sinon.assert.calledWith(loginOrRegister, res)
    }))
  })
})
