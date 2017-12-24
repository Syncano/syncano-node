/* global it describe afterEach beforeEach */
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import format from 'chalk'
import inquirer from 'inquirer'

import { getRandomString } from '@syncano/test-tools'

import { HostingSync } from '../../src/commands'
import printTools from '../../src/utils/print-tools'
import context from '../../src/utils/context'

sinon.test = sinonTestFactory(sinon)

describe('[commands] Sync Hosting', function () {
  let hostingSync = new HostingSync(context)
  let interEcho = null
  let echo = null

  beforeEach(function () {
    interEcho = sinon.stub()
    sinon.stub(printTools, 'echon')
    hostingSync = new HostingSync(context)
    echo = sinon.stub(printTools, 'echo').callsFake((content) => interEcho)
    sinon.stub(printTools, 'error')
    sinon.stub(hostingSync.session, 'load')
    sinon.stub(hostingSync.Socket, 'get').returns(Promise.resolve({
      getHosting: (hosting) => hosting,
      update: () => 'Socket updated...!'
    }))
  })

  afterEach(function () {
    interEcho.reset()
    printTools.echon.restore()
    printTools.echo.restore()
    printTools.error.restore()
    hostingSync.session.load.restore()
    hostingSync.Socket.get.restore()
  })

  describe('run', function () {
    let syncHosting = null
    let listLocal = null
    let exitProcess = null
    let warning = null
    const choices = [getRandomString('syncHosting_choices[0]'), getRandomString('syncHosting_choices[1]')]

    beforeEach(function () {
      syncHosting = sinon.stub(hostingSync, 'syncHosting')
      listLocal = sinon.stub(hostingSync.Socket, 'listLocal').returns(choices)
      exitProcess = sinon.stub(process, 'exit')
      warning = sinon.stub(printTools, 'warning')
    })

    afterEach(function () {
      hostingSync.syncHosting.restore()
      hostingSync.Socket.listLocal.restore()
      process.exit.restore()
      printTools.warning.restore()
    })

    it.skip('should print warning and exit process if no sockets specified in config', sinon.test(async function () {
      listLocal.returns([])
      this.stub(inquirer, 'prompt')

      await hostingSync.run([getRandomString('syncHosting_hostingName[0]'), {}])

      sinon.assert.calledOnce(exitProcess)
      sinon.assert.calledWith(warning, 'No Sockets were found in your config.')
    }))

    it.skip('should ask about Socket if is not specified in command', sinon.test(async function () {
      const question = {
        name: 'Socket',
        type: 'list',
        message: 'Choose socket in which you want to set up hosting',
        choices,
        default: 0
      }
      const prompt = this.stub(inquirer, 'prompt')

      await hostingSync.run([getRandomString('syncHosting_hostingName[1]'), {}])

      sinon.assert.calledWith(prompt, [question])
    }))

    it.skip('should call getHosting method with proper parameter', async function () {
      const hostingName = getRandomString('syncHosting_hostingName[2]')
      const socket = await hostingSync.Socket.get()
      const getHosting = sinon.spy(socket, 'getHosting')

      await hostingSync.run([hostingName, { socket: getRandomString('syncHosting_socket[0]') }])

      socket.getHosting.restore()

      sinon.assert.calledWith(getHosting, hostingName)
    })

    it.skip('should call syncHosting method with proper parameter', async function () {
      const hosting = {
        name: getRandomString('syncHosting_hosting_name[0]'),
        existRemotely: true
      }
      const socket = await hostingSync.Socket.get()

      sinon.stub(socket, 'getHosting').returns(hosting)

      await hostingSync.run([hosting.name, { socket: getRandomString('syncHosting_socket[1]') }])

      socket.getHosting.restore()

      sinon.assert.calledWith(syncHosting, hosting)
    })

    it.skip('should set hosting existRemotely after second getHosting call', async function () {
      const localHosting = {
        name: getRandomString('syncHosting_localHosting_name'),
        existRemotely: false
      }
      const remoteHosting = {
        name: localHosting.name,
        existRemotely: true
      }
      const socket = await hostingSync.Socket.get()

      sinon.stub(socket, 'getHosting')
        .onFirstCall()
          .returns(localHosting)
        .onSecondCall()
          .returns(remoteHosting)

      await hostingSync.run([localHosting.name, { socket: getRandomString('syncHosting_socket[2]') }])

      socket.getHosting.restore()

      sinon.assert.calledWith(syncHosting, remoteHosting)
    })
  })

  describe('syncHosting', function () {
    const hosting = {
      name: getRandomString('syncHosting_hosting_name[1]'),
      syncFiles: () => Promise.resolve(),
      getURL: () => 'Hosting_URL.com'
    }

    it('should print info about synced hosting', async function () {
      hostingSync.session.project = { instance: 'test_instance' }
      await hostingSync.syncHosting(hosting)

      sinon.assert.calledWith(echo, 8)
      sinon.assert.calledWith(interEcho, `Syncing hosting files for ${format.cyan(hosting.name)}`)
      sinon.assert.calledWith(interEcho, `${format.dim(hosting.getURL())}`)
    })

    it('should run syncFiles method of hosting class instance', sinon.test(async function () {
      hostingSync.session.project = { instance: 'test_instance' }
      const syncFiles = this.stub(hosting, 'syncFiles').returns(Promise.resolve())

      await hostingSync.syncHosting(hosting)

      sinon.assert.calledOnce(syncFiles)
    }))
  })
})
