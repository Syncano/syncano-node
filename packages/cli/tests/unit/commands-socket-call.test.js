/* global it describe afterEach beforeEach */
import _ from 'lodash'
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import format from 'chalk'
import inquirer from 'inquirer'
import dirtyChai from 'dirty-chai'
import chai from 'chai'

import { getRandomString } from '@syncano/test-tools'

import { SocketEndpointCall } from '../../src/commands'
import context from '../../src/utils/context'
import printTools from '../../src/utils/print-tools'

sinon.test = sinonTestFactory(sinon)

chai.use(dirtyChai)
const { expect } = chai

describe('[commands] Call Socket', function () {
  const socketEndpointCall = new SocketEndpointCall(context)

  const res = {
    status: 200,
    headers: {
      server: 'nginx',
      date: 'Fri, 20 Jan 2017 14:33:17 GMT',
      'content-type': 'text/plain; charset=utf-8',
      'transfer-encoding': 'chunked',
      connection: 'close',
      vary: 'Accept-Encoding',
      'cache-control': 'no-cache'
    },
    data: '{"test": "test"}'
  }

  const endpointObj = {
    existRemotely: true,
    getFullName: () => 'hello/hello',
    name: getRandomString('callSocket_endpoints[0]_name'),
    metadata: {
      parameters: {
        lastname: {
          type: 'string',
          description: 'Last name of the person you want to greet',
          example: 'Durden'
        },
        firstname: {
          type: 'string',
          description: 'First name of the person you want to greet',
          example: 'Tyler'
        }
      },
      response: {
        mimetype: 'text/plain',
        examples: [{}, {}]
      }
    },
    call: () => {}
  }

  let echo = null
  let interEcho = null
  let interEchon = null

  beforeEach(function () {
    interEcho = sinon.stub()
    interEchon = sinon.stub()
    echo = sinon.stub(printTools, 'echo').callsFake((content) => interEcho)
    sinon.stub(printTools, 'echon').callsFake((content) => interEchon)
  })

  afterEach(function () {
    interEcho.reset()
    printTools.echo.restore()
    printTools.echon.restore()
  })

  describe('validateValue', function () {
    it('should return true if param is present', function () {
      const validate = SocketEndpointCall.validateValue('param')

      expect(validate).to.be.true()
    })

    it('should return a string if param is not present', function () {
      const validate = SocketEndpointCall.validateValue()

      expect(validate).to.be.equal('We need this!')
    })
  })

  describe('promptParamQuestion', function () {
    const params = {
      lastname: {
        type: 'string',
        description: 'Last name of the person you want to greet',
        example: 'Durden'
      },
      firstname: {
        type: 'string',
        description: 'First name of the person you want to greet',
        example: 'Tyler'
      }
    }

    it('should be called with echo', function () {
      SocketEndpointCall.promptParamQuestion(params, 'lastname')

      sinon.assert.calledWith(echo, 4)
      sinon.assert.calledWith(
        interEcho,
        `- lastname ${format.dim(`(${params.lastname.type})`)} ${params.lastname.description}`
      )
    })

    it('should return question object', function () {
      const question = SocketEndpointCall.promptParamQuestion(params, 'lastname')

      // expect(question).to.be.an.object // eslint-disable-line
      expect(Object.keys(question)).to.be.eql(['name', 'message', 'default', 'validate'])
    })
  })

  describe('listParams', function () {
    it('should be called with proper arguments', sinon.test(function () {
      const listParams = this.stub(SocketEndpointCall, 'listParams')
      listParams(endpointObj, 'hello/hello')

      sinon.assert.calledWith(listParams, endpointObj)
    }))

    it('should be called with echo and proper message', sinon.test(function () {
      SocketEndpointCall.listParams(endpointObj)

      sinon.assert.calledWith(interEchon, `You can pass ${format.cyan(2)} `)
      sinon.assert.calledWith(
        echo,
        `parameter(s) to ${format.cyan(endpointObj.getFullName())} endpoint:`
      )
      sinon.assert.calledWith(echo, 4)
      expect(echo.callCount).to.be.equal(6)
    }))

    it('should invoke promptParamQuestion method', sinon.test(function () {
      const params = endpointObj.metadata.parameters
      const promptParamQuestion = this.stub(SocketEndpointCall, 'promptParamQuestion')

      SocketEndpointCall.listParams(endpointObj)

      sinon.assert.calledTwice(promptParamQuestion)
      sinon.assert.calledWith(promptParamQuestion, params)

      promptParamQuestion.restore()
    }))

    it('should return an array with question objects', function () {
      const questions = SocketEndpointCall.listParams(endpointObj)

      // expect(questions).to.be.an.array // eslint-disable-line
      Object.keys(questions).forEach((key) => {
        // expect(questions[key]).to.be.an.object // eslint-disable-line
        expect(Object.keys(questions[key])).to.be.eql(['name', 'message', 'default', 'validate'])
      })
    })
  })

  describe('formatResponse', function () {
    it('should echo response headers when bodyOnly is false', function () {
      SocketEndpointCall.formatResponse(res)

      // I skipped the printCode(res.statusCode) below as it was hard to mock
      sinon.assert.calledWith(interEcho, format.grey('statusCode:'))
      sinon.assert.calledWith(interEcho, format.grey('content-type:'), res.headers['content-type'])
      sinon.assert.calledWith(interEcho, format.grey('body:'))
    })

    it('should echo correct amount of times with proper padding', function () {
      SocketEndpointCall.formatResponse(res)

      sinon.assert.calledWith(echo, 4)
      expect(echo.args[0].length).to.be.equal(0)
      expect(echo.callCount).to.be.equal(7)
    })

    it('should not echo response headers when bodyOnly is true', function () {
      SocketEndpointCall.formatResponse(res, 'true')

      sinon.assert.neverCalledWith(interEcho, format.grey('statusCode:'))
      sinon.assert.neverCalledWith(interEcho, format.grey('content-type:'), res.headers['content-type'])
      sinon.assert.neverCalledWith(interEcho, format.grey('body:'))
    })
  })

  describe('run', function () {
    let socket = null
    let find = null
    const question = {
      name: 'lastname',
      message: `  Type in value for "${format.green('lastname')}" parameter`,
      default: 'Durden',
      validate: 'foo'
    }

    beforeEach(async function () {
      sinon.stub(socketEndpointCall.Socket, 'get').returns(Promise.resolve({
        getEndpoints: (resp) => resp,
        getEndpoint: (resp) => resp,
        callEndpoint: (resp) => resp
      }))
      socket = await socketEndpointCall.Socket.get()
      sinon.stub(socket, 'getEndpoints').returns([endpointObj])
      sinon.stub(socket, 'getEndpoint').returns(endpointObj)
      sinon.stub(endpointObj, 'call').returns(Promise.resolve(res))
      sinon.stub(SocketEndpointCall, 'listParams').returns([question, question])
      find = sinon.stub(_, 'find').returns({ name: 'hello' })
      sinon.stub(inquirer, 'prompt').returns(Promise.resolve({ name: 'foo' }))
    })

    afterEach(function () {
      socket.getEndpoints.restore()
      socket.getEndpoint.restore()
      endpointObj.call.restore()
      socketEndpointCall.Socket.get.restore()
      SocketEndpointCall.listParams.restore()
      _.find.restore()
      inquirer.prompt.restore()
    })

    it('should call getEndpoints method', async function () {
      await socketEndpointCall.run(['hello/hello', {}])

      sinon.assert.calledOnce(socket.getEndpoint)
    })

    it('should call "call" method', async function () {
      await socketEndpointCall.run(['hello/hello', {}])

      sinon.assert.calledOnce(endpointObj.call)
    })

    it('should call listParams method with proper params', async function () {
      const endpoint = 'hello/hello'

      await socketEndpointCall.run([endpoint, {}])

      sinon.assert.calledOnce(SocketEndpointCall.listParams)
      sinon.assert.calledWith(SocketEndpointCall.listParams, endpointObj)
    })

    it('should echo "No such endpoint!" if endpoint object not present', async function () {
      find.returns()
      const error = sinon.stub(printTools, 'error')
      endpointObj.existRemotely = false
      await socketEndpointCall.run(['hello/hello', {}])

      sinon.assert.calledWith(error, 'No such endpoint on the server! Make sure you have synced your socket.')
      error.restore()
    })
  })
})
