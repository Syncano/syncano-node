/* global it describe before afterEach beforeEach */
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import path from 'path'

import { getRandomString } from '@syncano/test-tools'

import getSettings from '../../src/settings'
import session from '../../src/utils/session'
import printTools from '../../src/utils/print-tools'
import Sockets from '../../src/utils/sockets'
import socketUtils from '../../src/utils/sockets/utils'

sinon.test = sinonTestFactory(sinon)

chai.use(chaiAsPromised)

describe('[Class] Socket', function () {
  const socketName = getRandomString('socketClass_socketName')
  const project = getSettings(path.join(process.cwd(), 'syncano')).project

  before(function () {
    return session.load()
  })

  beforeEach(function () {
    sinon.stub(project, 'save')
    sinon.stub(printTools, 'error')

    project.attributes.dependencies = {
      sockets: {
        [socketName]: {
          version: '0.1'
        }
      }
    }
  })

  afterEach(function () {
    project.save.restore()
    printTools.error.restore()
  })

  describe.skip('Install', function () {
    describe('with name parameter', function () {
      it('should call installSocket method with proper parameter', sinon.test(function () {
        const installSocket = this.stub(session.settings.project, 'installSocket')
        const registrySocket = { name: socketName }
        Sockets.install(registrySocket)
        sinon.assert.calledWith(installSocket, registrySocket)
        installSocket.restore()
      }))
    })
  })

  describe('Uninstall', function () {
    let uninstallRemote = null
    let uninstallLocal = null
    let getSocket = null
    const socket = {
      name: socketName,
      existLocally: true,
      existRemotely: true,
      localPath: '/path'
    }

    beforeEach(function () {
      uninstallRemote = sinon.stub(Sockets, 'uninstallRemote').returns(Promise.resolve({ name: socketName }))
      uninstallLocal = sinon.stub(Sockets, 'uninstallLocal')
      getSocket = sinon.stub(Sockets, 'get').withArgs(socketName)
    })

    afterEach(function () {
      Sockets.uninstallRemote.restore()
      Sockets.uninstallLocal.restore()
      Sockets.get.restore()
    })

    describe('with name parameter', function () {
      it('should call uninstallLocal method with proper parameter', async function () {
        getSocket.returns(Promise.resolve(socket))

        await Sockets.uninstall(socket)

        sinon.assert.calledWith(uninstallLocal, socket)
      })

      it('should not call uninstallLocal method', async function () {
        socket.existLocally = false
        getSocket.returns(Promise.resolve(socket))

        await Sockets.uninstall(socket)

        sinon.assert.notCalled(uninstallLocal)
      })

      it('should call uninstallRemote socket with proper parameter', async function () {
        getSocket.returns(Promise.resolve(socket))

        await Sockets.uninstall(socket)

        sinon.assert.calledWith(uninstallRemote, socketName)
      })

      it('should not call uninstallRemote socket with proper parameter', function () {
        socket.existRemotely = false
        getSocket.returns(Promise.resolve(socket))

        Sockets.uninstall(socket)
          .catch(() => {
            sinon.assert.notCalled(uninstallRemote)
          })
      })
    })
  })

  describe('local', function () {
    let removeDirectory = null
    let uninstallSocket = null
    let uninstallRemote = null

    const socket = {
      name: socketName,
      local: { src: getRandomString('socketClass_local_socket_src') },
      existLocally: true,
      existRemotely: true
    }

    beforeEach(function () {
      removeDirectory = sinon.stub(socketUtils, 'deleteFolderRecursive')
      uninstallSocket = sinon.stub(session.settings.project, 'uninstallSocket')
      uninstallRemote = sinon.stub(Sockets, 'uninstallRemote').returns(Promise.resolve({ name: socketName }))
    })

    afterEach(function () {
      socketUtils.deleteFolderRecursive.restore()
      session.settings.project.uninstallSocket.restore()
      uninstallRemote.restore()
    })

    it('should call method to remove socket from local config', async function () {
      socket.isProjectRegistryDependency = true
      Sockets.uninstall(socket)

      sinon.assert.calledWith(uninstallSocket, socketName)
    })

    it('should call method to remove socket folder', function () {
      Sockets.uninstallLocal(socket)

      sinon.assert.calledWith(removeDirectory, socket.localPath)
    })
  })
})
