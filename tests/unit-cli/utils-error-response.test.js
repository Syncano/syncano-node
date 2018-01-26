/* global describe it beforeEach afterEach */
import { expect } from 'chai'
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import format from 'chalk'
import createError from 'create-error'
import Raven from 'raven'

import printTools from '../../src/utils/print-tools'
import ErrorResponse from '../../src/utils/error-response'

const RequestError = createError('RequestError')
const SystemError = createError('SystemError')

sinon.test = sinonTestFactory(sinon)

const Errors = {
  404: {
    status: 404,
    response: {
      request: {
        url: 'https://www.lotsOfInternets.com'
      }
    }
  },
  403: {
    status: 403,
    response: {
      request: {
        url: 'https://www.lotsOfInternets.com'
      }
    }
  },
  ENOENT: {
    errno: -42,
    path: '/where/am/i',
    code: 'ENOENT'
  },
  ENONONO: {
    errno: -431234,
    path: '/where/am/i',
    code: 'ENONONO'
  }
}

describe('[error-response]', function () {
  let setContext = null
  let captureException = null

  beforeEach(function () {
    setContext = sinon.stub(Raven, 'setContext')
    captureException = sinon.stub(Raven, 'captureException')
  })

  afterEach(function () {
    Raven.setContext.restore()
    Raven.captureException.restore()
  })

  describe('checkErrorType method', function () {
    it('should return requestError string on RequestError', function () {
      try {
        throw new RequestError()
      } catch (err) {
        const errorType = ErrorResponse.checkErrorType(err)

        expect(errorType).to.be.equal('requestError')
      }
    })
    it('should return systemError when error number is less than 0', function () {
      try {
        throw new SystemError('Things happened', Errors.ENOENT)
      } catch (err) {
        const errorType = ErrorResponse.checkErrorType(err)

        expect(errorType).to.be.equal('systemError')
      }
    })
    it('should return default when error is not a system or request error', function () {
      try {
        throw new Error()
      } catch (err) {
        const errorType = ErrorResponse.checkErrorType(err)

        expect(errorType).to.be.equal('default')
      }
    })
  })

  describe('handleRequestError method', function () {
    let echo = null
    let error = null

    beforeEach(function () {
      echo = sinon.stub(printTools, 'echo')
      error = sinon.stub(printTools, 'error')
    })
    afterEach(function () {
      echo.restore()
      error.restore()
    })

    it('should echo default error if status is not 404', function () {
      try {
        throw new RequestError('Bad thing')
      } catch (err) {
        ErrorResponse.handleRequestError(err, 'This', 'thing')

        sinon.assert.calledOnce(error)
        expect(error.firstCall.args.length).to.be.equal(1)
        expect(error.firstCall.args[0].message).to.be.equal('Bad thing')
      }
    })

    it('should throw custom error if status is 404', function () {
      try {
        throw new RequestError('Bad thing', Errors[404])
      } catch (err) {
        ErrorResponse.handleRequestError(err, 'This', 'thing')

        const errorMessage = '"This" thing could not be found on your remote Syncano account!'
        const errorMessageUrl = 'We\'ve tried reaching the following url: https://www.lotsOfInternets.com'
        const args = error.firstCall.args

        sinon.assert.calledOnce(error)
        sinon.assert.calledWith(error, err)

        expect(args.length).to.be.equal(3)
        expect(args[1]).to.be.equal(errorMessage)
        expect(args[2]).to.be.equal(errorMessageUrl)
      }
    })
    it('should echo additional message if status is 404', function () {
      try {
        throw new RequestError('Bad thing', Errors[404])
      } catch (err) {
        ErrorResponse.handleRequestError(err, 'This', 'thing')

        sinon.assert.calledTwice(echo)
        sinon.assert.calledWith(echo, `Did you run ${format.green('syncano-cli deploy')} command?`)
      }
    })
  })
  describe('handleSystemError method', function () {
    let error = null

    beforeEach(function () {
      error = sinon.stub(printTools, 'error')
    })
    afterEach(function () {
      error.restore()
    })

    it('should throw custom error if error status is ENOENT', function () {
      try {
        throw new SystemError('Things happened', Errors.ENOENT)
      } catch (err) {
        ErrorResponse.handleSystemError(err)
        const args = error.firstCall.args

        sinon.assert.calledOnce(error)
        expect(args[0]).to.be.equal('File or directory not found at:')
        expect(args[1]).to.be.equal(err.path)
      }
    })
    it('should throw default error for unknown status', function () {
      try {
        throw new SystemError('Things happened', Errors.ENONONO)
      } catch (err) {
        ErrorResponse.handleSystemError(err)

        sinon.assert.calledOnce(error)
        sinon.assert.calledWith(error, err)
      }
    })
  })
  describe('captureException method', function () {
    let errorResponse = null

    it('should set session and account in raven context if session present', function () {
      try {
        throw new SystemError('Things happened', Errors.ENOENT)
      } catch (err) {
        const contextStub = {
          session: {
            settings: {
              account: {
                attributes: {
                  auth_key: '123'
                }
              }
            }
          }
        }

        const session = contextStub.session
        const account = contextStub.session.settings
        errorResponse = new ErrorResponse(contextStub)
        errorResponse.captureException(err)

        const args = setContext.firstCall.args

        sinon.assert.calledOnce(setContext)
        expect(args[0].user.session).to.contain(session)
        expect(args[0].user).to.contain(account)
      }
    })
    it('should set context only in raven context if session not present', function () {
      try {
        throw new SystemError('Things happened', Errors.ENOENT)
      } catch (err) {
        const contextStub = { context: 'foo' }
        errorResponse = new ErrorResponse(contextStub)
        errorResponse.captureException(err)

        const args = setContext.firstCall.args

        sinon.assert.calledOnce(setContext)
        expect(args[0].user.context).to.contain(contextStub)
      }
    })
    it('should send exception to Sentry', function () {
      try {
        throw new SystemError('Things happened', Errors.ENOENT)
      } catch (err) {
        const contextStub = { context: 'foo' }
        errorResponse = new ErrorResponse(contextStub)
        errorResponse.captureException(err)

        sinon.assert.calledOnce(captureException)
        sinon.assert.calledWith(captureException, err)
      }
    })
  })
  describe('handle method', function () {
    let errorResponse = null

    beforeEach(function () {
      errorResponse = new ErrorResponse({ context: 'foo' })
      sinon.stub(ErrorResponse, 'handleRequestError')
      sinon.stub(ErrorResponse, 'handleSystemError')
      sinon.stub(printTools, 'error')
    })

    afterEach(function () {
      ErrorResponse.handleRequestError.restore()
      ErrorResponse.handleSystemError.restore()
      printTools.error.restore()
    })

    it('should call checkErrorType method', sinon.test(function () {
      try {
        throw new Error('massive error')
      } catch (err) {
        this.spy(ErrorResponse, 'checkErrorType')

        errorResponse.handle(err)

        sinon.assert.calledWith(ErrorResponse.checkErrorType, err)
        sinon.assert.calledOnce(ErrorResponse.checkErrorType)
      }
    }))
    it('should call captureException method', sinon.test(function () {
      try {
        throw new Error('massive error')
      } catch (err) {
        this.stub(errorResponse, 'captureException')
        errorResponse.handle(err)

        sinon.assert.calledOnce(errorResponse.captureException)
      }
    }))
    it('should call handleRequestError on request error', function () {
      try {
        throw new RequestError('Bad thing', Errors[404])
      } catch (err) {
        errorResponse.handle(err)

        sinon.assert.calledOnce(ErrorResponse.handleRequestError)
      }
    })
    it('should call handleSystemError on system error', function () {
      try {
        throw new SystemError('Things happened', Errors.ENOENT)
      } catch (err) {
        errorResponse.handle(err)

        sinon.assert.calledOnce(ErrorResponse.handleSystemError)
      }
    })
    it('should call default error on other errors', function () {
      try {
        throw new Error()
      } catch (err) {
        errorResponse.handle(err)

        sinon.assert.calledOnce(printTools.error)
      }
    })
  })
})
