/* global describe it beforeEach afterEach */
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import format from 'chalk'
import inquirer from 'inquirer'

import { getRandomString } from '@syncano/test-tools'

import { SocketUninstall } from '../../src/commands'
import printTools from '../../src/utils/print-tools'
import context from '../../src/utils/context'

sinon.test = sinonTestFactory(sinon)

describe('[commands] Uninstall Socket', function () {
  const socketName = getRandomString('uninstallSocket_socketName')
  const socketUninstall = new SocketUninstall(context)
  const interEcho = sinon.stub()
  let exitProcess = null
  let prompt = null
  let echo = null
  let warning = null
  let uninstall = null
  let getSocket = null

  beforeEach(function () {
    exitProcess = sinon.stub(process, 'exit')
    prompt = sinon.stub(inquirer, 'prompt')
    echo = sinon.stub(printTools, 'echo').callsFake((content) => interEcho)
    warning = sinon.stub(printTools, 'warning').callsFake((content) => interEcho)
    uninstall = sinon.stub(socketUninstall.Socket, 'uninstall')
    getSocket = sinon.stub(socketUninstall.Socket, 'get').returns({ name: socketName })
  })

  afterEach(function () {
    process.exit.restore()
    inquirer.prompt.restore()
    printTools.echo.restore()
    printTools.warning.restore()
    socketUninstall.Socket.uninstall.restore()
    socketUninstall.Socket.get.restore()
  })

  describe('run', function () {
    it('should exit process if not exists locally and remotely', async function () {
      uninstall.returns(Promise.resolve())
      prompt.returns({ confirm: true })

      await socketUninstall.run([null, {}])

      sinon.assert.called(exitProcess)
    })

    it('should print warning response if not exists locally and remotely', async function () {
      uninstall.returns(Promise.resolve())
      prompt.returns({ confirm: true })

      await socketUninstall.run([null, {}])

      sinon.assert.calledWith(interEcho, 'No Socket was found on server nor in config!')
    })

    it('should exit process if not confirmed', async function () {
      uninstall.returns(Promise.resolve())
      prompt.returns({ confirm: false })

      await socketUninstall.run([null, {}])

      sinon.assert.called(exitProcess)
    })

    it('should not exit process if uninstall socket confirmed', async function () {
      uninstall.returns(Promise.resolve())
      getSocket.returns({
        existLocally: true,
        existRemotely: true
      })
      prompt.returns({ confirm: true })

      await socketUninstall.run([null, {}])

      sinon.assert.notCalled(exitProcess)
    })

    it('should print uninstalled socket response with proper padding', async function () {
      const response = `Socket ${format.cyan(socketName)} has been ${format.green('successfully')} removed!`
      uninstall.returns(Promise.resolve())
      prompt.returns({ confirm: true })
      getSocket.returns({
        socketName,
        existLocally: true,
        existRemotely: true
      })

      await socketUninstall.run([socketName, {}])

      sinon.assert.calledWith(echo, 4)
      sinon.assert.calledWith(interEcho, response)
    })

    it('should print warning response when promise is rejected', async function () {
      const error = 'Socket uninstall rejected!'
      uninstall.returns(Promise.reject(error))
      prompt.returns({ confirm: true })

      await socketUninstall.run([socketName, {}])

      sinon.assert.calledWith(warning, error)
    })
  })
})
