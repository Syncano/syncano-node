/* global it describe afterEach beforeEach */
import dirtyChai from 'dirty-chai'
import chai from 'chai'
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import format from 'chalk'
import inquirer from 'inquirer'

import { getRandomString } from '@syncano/test-tools'

import {HostingDelete} from '../../src/commands'
import printTools, { p } from '../../src/utils/print-tools'
import context from '../../src/utils/context'

sinon.test = sinonTestFactory(sinon)

chai.use(dirtyChai)
const { expect } = chai

describe('[commands] Delete Hosting', function () {
  const hostingDelete = new HostingDelete(context)
  const hostingName = getRandomString('deleteHosting_hostingName')
  let echo = null
  let interEcho = null
  let warning = null
  let error = null
  let processExit = null
  const socketsExample = ['hello2']
  const expectedQuestions = [{
    type: 'confirm',
    name: 'delete',
    message: p(2)(`Are you sure you want to remove: ${format.red(hostingName)}`),
    default: false
  }]

  beforeEach(function () {
    interEcho = sinon.stub()
    echo = sinon.stub(printTools, 'echo').callsFake((content) => interEcho)
    warning = sinon.stub(printTools, 'warning')
    error = sinon.stub(printTools, 'error')
    processExit = sinon.stub(process, 'exit')
  })

  afterEach(function () {
    interEcho.reset()
    printTools.echo.restore()
    printTools.warning.restore()
    printTools.error.restore()
    process.exit.restore()
  })

  describe('run', async function () {
    let questions = null
    let socket = null
    let hosting = null
    let prompt = null

    beforeEach(async function () {
      prompt = sinon.stub(inquirer, 'prompt').returns(Promise.resolve({ delete: true, socket: hostingName }))
      // sinon.stub(hostingDelete.Socket, 'get').returns(Promise.resolve(
      //   {
      //     name: socketName,
      //     deleteHosting: (res) => res,
      //     update: (res) => res
      //   }
      // ))
      hosting = sinon.stub(hostingDelete.Hosting, 'get').returns(Promise.resolve(
        {
          name: hostingName,
          delete: () => Promise.resolve({ name: hostingName })
        }
      ))
      // socket = await hostingDelete.Socket.get(socket, hostingName)
      // sinon.stub(socket, 'update').returns(Promise.resolve({}))
      // sinon.stub(socket, 'deleteHosting')
    })

    afterEach(function () {
      inquirer.prompt.restore()
      // hostingDelete.Socket.get.restore()
      hostingDelete.Hosting.get.restore()
      // socket.update.restore()
      // socket.deleteHosting.restore()
    })

    it.skip('should call getQuestions method', function () {
      questions = HostingDelete.getQuestions(socketsExample, hostingName)

      expect(questions).to.be.called // eslint-disable-line
    })

    it.skip('should call delete hosting method', async function () {
      await hostingDelete.run([hostingName, {}])

      sinon.assert.calledOnce(socket.deleteHosting)
    })

    it.skip('should call socket update method', async function () {
      await hostingDelete.run([hostingName, {}])

      sinon.assert.calledOnce(socket.update)
    })

    it.skip('should call socket update method and get rejected', async function () {
      socket.update.returns(Promise.reject(new Error('error')))

      try {
        await hostingDelete.run([hostingName, {}])
      } catch (err) {
        sinon.assert.calledOnce(socket.update)
      }
    })

    it('should print warning if hosting doesnt exist remotely nor locally', async function () {
      hosting.returns(Promise.resolve({
        name: hostingName,
        existRemotely: false,
        existLocally: false,
        delete: () => Promise.resolve({ name: hostingName })
      }))
      await hostingDelete.run([hostingName, {}])

      sinon.assert.called(warning)
    })

    it('should call socket and print deleted from server message', async function () {
      hosting.returns(Promise.resolve({
        name: hostingName,
        existRemotely: true,
        delete: () => Promise.resolve({ name: hostingName })
      }))

      await hostingDelete.run([hostingName, {}])

      sinon.assert.calledWith(interEcho, `Hosting ${format.cyan(hostingName)} has been ${format.green('successfully')} deleted!`)
    })

    it.skip('should be called with expected questions', sinon.test(async function () {
      this.stub(HostingDelete, 'getQuestions').returns(expectedQuestions)

      await hostingDelete.run([hostingName, {}])

      sinon.assert.calledWith(prompt, expectedQuestions)
    }))

    it('should exit process if no response socket', async function () {
      prompt.returns(Promise.resolve({}))

      await hostingDelete.run([hostingName, {}])

      sinon.assert.called(processExit)
    })

    it('should print echo with correct padding on delete hosting', async function () {
      await hostingDelete.run([hostingName, {}])

      sinon.assert.calledWith(echo, 4)
    })

    it.skip('should print error on socket update reject', async function () {
      socket.update.returns(Promise.reject(new Error('error')))

      await hostingDelete.run([hostingName, {}])

      sinon.assert.calledOnce(error)
    })
  })

  describe.skip('findSocketsWithHosting', function () {
    let socketsHostings = null
    const example = {
      hello: {
        test: {
          src: '../hostings', cname: null
        }
      }
    }
    const key = Object.keys(example)[0]

    beforeEach(function () {
      socketsHostings = sinon.stub(hostingDelete.session.settings.project, 'getHostingsList')
    })

    afterEach(function () {
      hostingDelete.session.settings.project.getHostingsList.restore()
    })

    it.skip('should print error if there are no sockets with hostings', async function () {
      await hostingDelete.findSocketsWithHosting()

      sinon.assert.calledOnce(warning)
    })

    it.skip('should exit process if there are no sockets with hostings', async function () {
      socketsHostings.returns([])

      await hostingDelete.findSocketsWithHosting()

      sinon.assert.calledOnce(processExit)
    })

    it.skip('should sockethosting return socket', async function () {
      socketsHostings.returns(example)

      const socketsWithHosting = await hostingDelete.findSocketsWithHosting('test')

      expect(socketsWithHosting).to.be.eql([key])
    })

    it.skip('should return an array', async function () {
      const result = await hostingDelete.findSocketsWithHosting(hostingName)

      expect(result).to.be.an.array // eslint-disable-line
    })
  })

  describe('getQuestions', function () {
    it('should return expected questions', function () {
      const questions = HostingDelete.getQuestions(hostingName)

      expect(questions).to.be.eql(expectedQuestions)
    })
  })
})
