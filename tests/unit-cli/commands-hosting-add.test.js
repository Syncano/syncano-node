/* global it describe before afterEach beforeEach */
import dirtyChai from 'dirty-chai'
import chai from 'chai'
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import inquirer from 'inquirer'
import format from 'chalk'

import { getRandomString } from '@syncano/test-tools'

import { HostingSync, HostingAdd } from '../../src/commands'
import Hosting from '../../src/utils/hosting'
import context from '../../src/utils/context'
import printTools, { p } from '../../src/utils/print-tools'

sinon.test = sinonTestFactory(sinon)

chai.use(dirtyChai)
const { expect } = chai

describe('[commands] Add Hosting', function () {
  const hostingAdd = new HostingAdd(context)

  describe.skip('run', function () {
    let prompt = null
    let socketGet = null
    const updateSocket = null
    const socket = {
      socketName: getRandomString('addHosting_socket_socketName'),
      addHosting: () => 'Hosting added'
    }

    beforeEach(function () {
      prompt = sinon.stub(inquirer, 'prompt')
      sinon.stub(hostingAdd, 'getQuestions')
      socketGet = sinon.stub(hostingAdd.Socket, 'get').returns(socket)
    })

    afterEach(function () {
      inquirer.prompt.restore()
      hostingAdd.getQuestions.restore()
      hostingAdd.Socket.get.restore()
    })

    it('should get socket with socket name from prompt as parameter if not specified in command', async function () {
      prompt.returns({ socket: socket.name })

      await hostingAdd.run([null, {}])

      sinon.assert.calledWith(socketGet, socket.name)
    })

    it('should get socket with socket name from command as parameter if specified', async function () {
      await hostingAdd.run([null, { socket: socket.name }])

      sinon.assert.calledWith(socketGet, socket.name)
    })

    it('should call addHosting method with proper parameters', async function () {
      const hostingName = getRandomString('addHosting_hostingName')
      const cname = getRandomString('addHosting_cname')
      const path = getRandomString('addHosting_path')
      const hostingSocket = await hostingAdd.Socket.get()
      const addHosting = sinon.stub(hostingSocket, 'addHosting')
      const params = {
        src: `../${path}`,
        cname
      }
      prompt.returns({
        name: hostingName,
        path,
        cname
      })

      await hostingAdd.run([null, {}])

      hostingSocket.addHosting.restore()
      sinon.assert.calledWith(addHosting, hostingName, params)
    })

    it('should call updateSocket method', async function () {
      await hostingAdd.run([null, {}])

      sinon.assert.called(updateSocket)
    })
  })

  describe.skip('updateSocket', function () {
    let error = null
    let echo = null
    let interEcho = null
    const updateSocket = null
    let syncNewHosting = null

    before(function () {
      hostingAdd.socket = {
        update: () => 'Socket updated'
      }
    })

    beforeEach(function () {
      interEcho = sinon.stub()
      error = sinon.stub(printTools, 'error')
      echo = sinon.stub(printTools, 'echo').callsFake((content) => interEcho)
      syncNewHosting = sinon.stub(hostingAdd, 'syncNewHosting')
    })

    afterEach(function () {
      interEcho.reset()
      printTools.error.restore()
      printTools.echo.restore()
      hostingAdd.syncNewHosting.restore()
    })

    it('should print error if promise rejected', async function () {
      updateSocket.returns(Promise.reject(new Error('Error message')))

      await hostingAdd.updateSocket()

      sinon.assert.calledWith(error.message, 'Error message')
    })

    it('should print proper response and run sync Hosting process if update status is ok', async function () {
      updateSocket.returns(Promise.resolve({ status: 'ok' }))

      await hostingAdd.updateSocket()

      sinon.assert.calledWith(echo, 8)
      sinon.assert.calledWith(interEcho, 'Hosting successfully added!')
      sinon.assert.calledOnce(syncNewHosting)
    })

    it('should print error with update status if update status is not ok', async function () {
      const failMsg = { status: 'fail', message: 'fail message' }
      updateSocket.returns(Promise.resolve(failMsg))

      await hostingAdd.updateSocket()

      sinon.assert.calledWith(error, failMsg.message)
    })
  })

  describe('syncNewHosting', function () {
    let echo = null
    let interEcho = null
    let exitProcess = null
    let prompt = null

    before(function () {
      hostingAdd.hostingName = getRandomString('addHosting_syncNewHosting_hostingName')
      hostingAdd.socket = {
        socketName: getRandomString('addHosting_syncNewHosting_socket_socketName')
      }
    })

    beforeEach(function () {
      interEcho = sinon.stub()
      echo = sinon.stub(printTools, 'echo').callsFake((content) => interEcho)
      prompt = sinon.stub(inquirer, 'prompt').returns({})
      exitProcess = sinon.stub(process, 'exit')
    })

    afterEach(function () {
      interEcho.reset()
      printTools.echo.restore()
      inquirer.prompt.restore()
      process.exit.restore()
    })

    it('should ask prompt proper question', async function () {
      const question = {
        type: 'confirm',
        name: 'confirm',
        message: p(2)('Do you want to sync files now?'),
        default: false
      }

      await hostingAdd.syncNewHosting()

      sinon.assert.calledWith(prompt, [question])
    })

    it('should print info how to sync files and exit process if not confirmed in prompt', async function () {
      const syncInfo = `To sync files use: ${format.cyan(`syncano-cli hosting sync ${hostingAdd.hostingName}`)}`
      prompt.returns({ confirm: false })

      await hostingAdd.syncNewHosting()

      sinon.assert.calledWith(echo, 4)
      sinon.assert.calledWith(interEcho, syncInfo)
      sinon.assert.calledOnce(exitProcess)
    })

    it('should call run method with proper parameters in new HostingSync class instance', async function () {
      const runHostingSync = sinon.stub(HostingSync.prototype, 'run').callsFake(() => 0)

      prompt.returns({ confirm: true })

      await hostingAdd.syncNewHosting()

      HostingSync.prototype.run.restore()
      sinon.assert.calledWith(runHostingSync, [hostingAdd.hostingName, { socket: hostingAdd.socket.name }])
    })
  })

  describe.skip('getQuestions', function () {
    let warning = null
    let echo = null
    let interEcho = null
    let listLocal = null
    let getDirectories = null
    let exitProcess = null
    const localSockets = [
      getRandomString('addHosting_getQuestions_localSockets[0]'),
      getRandomString('addHosting_getQuestions_localSockets[1]')
    ]
    const directories = [
      getRandomString('addHosting_getQuestions_directories[0]'),
      getRandomString('addHosting_getQuestions_directories[0]')
    ]

    before(function () {
      hostingAdd.socket = {
        update: () => 'Socket updated'
      }
    })

    beforeEach(function () {
      interEcho = sinon.stub()
      warning = sinon.stub(printTools, 'warning')
      echo = sinon.stub(printTools, 'echo').callsFake((content) => interEcho)
      listLocal = sinon.stub(hostingAdd.Socket, 'listLocal').returns(localSockets)
      getDirectories = sinon.stub(Hosting, 'getDirectories').returns(directories)
      exitProcess = sinon.stub(process, 'exit')
    })

    afterEach(function () {
      interEcho.reset()
      printTools.warning.restore()
      printTools.echo.restore()
      hostingAdd.Socket.listLocal.restore()
      Hosting.getDirectories.restore()
      process.exit.restore()
    })

    it('should print warning and exit process if no Sockets specified in config', function () {
      listLocal.returns([])

      hostingAdd.getQuestions()

      sinon.assert.calledWith(warning, 'No Sockets were found in your config.')
      sinon.assert.called(exitProcess)
    })

    it('should print info that a folder for new hosting does not exist and then exit process', function () {
      getDirectories.returns([])

      hostingAdd.getQuestions()

      sinon.assert.calledWith(echo, 4)
      sinon.assert.calledWith(interEcho, "You don't have a folder for hostings in your project.")
      sinon.assert.calledWith(interEcho, `Type ${format.green('mkdir <folder_name>')} to create a folder.`)
      sinon.assert.called(exitProcess)
    })

    it('should return only name hosting question', function () {
      const expectedQuestion = {
        name: 'name',
        message: p(6)('Please name this hosting'),
        default: 'staging',
        validate: (value) => {
          if (!value) {
            return 'This parameter is required!'
          }
          return true
        }
      }
      hostingAdd.socketName = getRandomString('addHosting_getQuestions_hostingAdd_socketName')
      hostingAdd.path = getRandomString('addHosting_getQuestions_hostingAdd_path')
      hostingAdd.cname = getRandomString('addHosting_getQuestions_hostingAdd_cname')

      const questions = hostingAdd.getQuestions()

      expect(questions.toString()).to.be.equal([expectedQuestion].toString())
    })

    it('should return all 4 questions', function () {
      const expectedQuestions = [
        {
          name: 'name',
          message: p(6)('Please name this hosting'),
          default: 'staging',
          validate: (value) => {
            if (!value) {
              return 'This parameter is required!'
            }
            return true
          }
        },
        {
          name: 'socket',
          type: 'list',
          message: p(6)('Please choose socket in which you want to set up hosting'),
          choices: localSockets,
          default: 1
        },
        {
          name: 'path',
          type: 'list',
          message: p(6)('Please choose directory of your files'),
          choices: directories
        },
        {
          name: 'cname',
          message: p(6)('Set CNAME now (your own domain) or leave empty?')
        }
      ]
      hostingAdd.socketName = undefined
      hostingAdd.path = undefined
      hostingAdd.cname = undefined

      const questions = hostingAdd.getQuestions()

      expect(questions.toString()).to.be.equal(expectedQuestions.toString())
    })
  })
})
