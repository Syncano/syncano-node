/* global it describe afterEach beforeEach */
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import inquirer from 'inquirer'
import format from 'chalk'

import { getRandomString } from '@syncano/test-tools'

import { SocketCreate } from '../../src/commands'
import context from '../../src/utils/context'
import printTools from '../../src/utils/print-tools'

sinon.test = sinonTestFactory(sinon)

describe('[commands] Create Socket', function () {
  const socketCreate = new SocketCreate(context)
  let echo = null
  let interEcho = null
  let error = null
  let prompt = null
  let create = null

  beforeEach(function () {
    interEcho = sinon.stub()
    create = sinon.stub(socketCreate.Socket, 'create')
    prompt = sinon.stub(inquirer, 'prompt')
    echo = sinon.stub(printTools, 'echo').callsFake((content) => interEcho)
    error = sinon.stub(printTools, 'error')
  })

  afterEach(function () {
    interEcho.reset()
    socketCreate.Socket.create.restore()
    inquirer.prompt.restore()
    printTools.echo.restore()
    printTools.error.restore()
  })

  describe.skip('with parameter specified', function () {
    const templateName = getRandomString('createSocket_templateName')
    const socketName = getRandomString('createSocket_socketName')
    const returnedSocketPath = 'Get Socket Path'

    beforeEach(function () {
      prompt.returns({ template: templateName })
    })

    it('should call prompt with proper question', async function () {
      const expectedQuestions = [{
        name: 'template',
        type: 'list',
        message: '  Choose template for your Socket',
        choices: ['    empty - Empty Socket', '    example - Example Socket with one mocked endpoint (recommended)'],
        default: 1
      }]

      create.returns(Promise.resolve({ getSocketPath: () => returnedSocketPath }))

      await socketCreate.run([socketName])

      sinon.assert.calledWith(prompt, expectedQuestions)
    })

    it('should call Socket.create with proper parameters', async function () {
      create.returns(Promise.resolve({ getSocketPath: () => returnedSocketPath }))

      await socketCreate.run([socketName])

      sinon.assert.calledWith(create, socketName, templateName)
    })

    it('should call echo metod with proper parameters when Socket.create is resolved', async function () {
      const expectedPrint = `Your Socket configuration is stored at ${format.cyan(returnedSocketPath)}`

      create.returns(Promise.resolve({ getSocketPath: () => returnedSocketPath }))

      await socketCreate.run([socketName])

      sinon.assert.calledWith(echo, 4)
      sinon.assert.calledWith(interEcho, expectedPrint)
    })

    it('should call error metod with proper parameters when Socket.create is rejected', async function () {
      create.returns(Promise.reject(new Error('error')))

      await socketCreate.run([socketName])

      sinon.assert.calledWith(error, 'error')
    })
  })
})
