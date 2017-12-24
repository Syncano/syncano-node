/* global it describe afterEach beforeEach */
import dirtyChai from 'dirty-chai'
import chai from 'chai'
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import Raven from 'raven'

import { getRandomString } from '@syncano/test-tools'

import session from '../../src/utils/session'
import Hosting, { HostingFile } from '../../src/utils/hosting'
import utils from '../../src/utils'

import printTools from '../../src/utils/print-tools'

sinon.test = sinonTestFactory(sinon)

chai.use(dirtyChai)
const { expect } = chai

describe('[utils/hosting] hosting', function () {
  describe('class Hosting', function () {
    const socketName = getRandomString('hostingClass_socket_name')
    const hostingName = getRandomString('hostingClass_hosting_name')
    let hosting = null
    let hostingConnection = null
    let exitProcess = null
    let errorPrint = null
    let captureException = null

    const socket = {
      name: socketName,
      settings: {
        loaded: true,
        getHosting () {
          return {}
        }
      }
    }

    beforeEach(function () {
      hosting = new Hosting(socket, hostingName)
      hostingConnection = sinon.stub(session.connection, 'hosting')
      exitProcess = sinon.stub(process, 'exit')
      errorPrint = sinon.stub(printTools, 'error')
      captureException = sinon.stub(Raven, 'captureException')
    })

    afterEach(function () {
      hostingConnection.restore()
      exitProcess.restore()
      errorPrint.restore()
      captureException.restore()
    })

    describe('static get', function () {
      it.skip('should call loadRemote', sinon.test(function () {
        const loadRemote = this.stub(Hosting.prototype, 'loadRemote')
        this.stub(Hosting.prototype, 'loadLocal')

        Hosting.get({ name: 'hello' }, 'staging')

        sinon.assert.calledOnce(loadRemote)
      }))
    })

    describe.skip('static getURL', function () {
      it('should return null when paremeter is empty', function () {
        const hostingUrl = Hosting.getURL()

        expect(hostingUrl).to.be.null()
      })

      it('should return null when not found instance in project', function () {
        session.project = {}
        const hostingUrl = Hosting.getURL('sampleHosting')

        expect(hostingUrl).to.be.null()
      })

      it('should return proper syncano hosting url when hosting exists', function () {
        const stagingHostingName = 'staging'
        session.project = { instance: getRandomString('hostingClass_static_getURL_session_projectPath') }
        const expectedResult = `${stagingHostingName}--${session.project.instance}`

        const hostingUrl = Hosting.getURL(stagingHostingName)

        expect(hostingUrl).to.contain(expectedResult)
      })
    })

    describe.skip('getURL', function () {
      it('should return properly formated url ', function () {
        hosting.name = getRandomString('hostingClass_getURL_hosting_name')
        session.project = { instance: getRandomString('hostingClass_getURL_session_project') }
        const expectedResult = `${hosting.name}--${session.project.instance}`

        const hostingUrl = hosting.getURL()

        expect(hostingUrl).to.contain(expectedResult)
      })
    })

    describe.skip('getLocalFilePath', function () {
      it('should get valid (File) path', function () {
        hosting.path = getRandomString('hostingClass_getLocalFilePath_hosting_path')
        const pathName = `files/fileName_${getRandomString('hostingClass_getLocalFilePath_pathName')}`
        const file = { localPath: `${hosting.path}${pathName}` }

        const hostingPath = hosting.getLocalFilePath(file)

        expect(hostingPath).to.be.equal(pathName)
      })

      it('should return error when parameter is empty', function () {
        const hostingPath = hosting.getLocalFilePath()

        expect(hostingPath).to.be.null()
      })
    })

    describe.skip('listLocalFiles', function () {
      it('should return EOENT error code when hosting path does not exist', async function () {
        hosting.path = getRandomString('hostingClass_listLocalFiles_hosting_path')
        const filesList = await hosting.listLocalFiles()

        expect(filesList).to.be.equal('ENOENT')
      })

      it('should return empty array when hosting path is not specified', async function () {
        hosting.path = null

        const filesList = await hosting.listLocalFiles()

        expect(filesList).to.be.eql([])
      })

      it('should return array of files', async function () {
        const files = [
          getRandomString('hostingClass_listLocalFiles_files[0]'),
          getRandomString('hostingClass_listLocalFiles_files[1]')
        ]
        const expectedResult = [{ path: files[0] }, { path: files[1] }]
        const loadLocal = sinon.stub(HostingFile.prototype, 'loadLocal')
        sinon.stub(utils, 'getFiles').returns(Promise.resolve(files))
        hosting.path = getRandomString('hostingClass_listLocalFiles_hosting_path')

        await hosting.listLocalFiles()

        loadLocal.restore()
        utils.getFiles.restore()
        sinon.assert.calledWith(loadLocal, expectedResult[0])
      })
    })

    describe.skip('getCnameURL', function () {
      it('returns cname if exists ', function () {
        hosting.domains = ['test.domain.io', 'test2.domain.io']

        const cnameUrl = hosting.getCnameURL()

        expect(cnameUrl).to.contain(hosting.domains[0])
      })

      it('returns undefined if no cname found', function () {
        hosting.domains = []

        const cnameUrl = hosting.getCnameURL()

        expect(cnameUrl).to.be.undefined()
      })
    })

    describe.skip('static listRemote', function () {
      it('should return empty array if no remote hostings exist', async function () {
        const hostingsArray = []
        hostingConnection.returns({
          list: () => Promise.resolve(hostingsArray)
        })

        const remoteHostings = await Hosting.listRemote('hello')

        expect(remoteHostings).to.eql(hostingsArray)
      })

      it('should return hostings array of objects if remote hostings exists', async function () {
        const hostingsArray = ['staging', 'production']
        hosting.path = getRandomString('hostingClass_static_listRemote_hosting_path')
        hostingConnection.returns({
          list: () => Promise.resolve(hostingsArray)
        })
        sinon.stub(Hosting.prototype, 'loadLocal')

        const remoteHostings = await Hosting.listRemote('hello')

        Hosting.prototype.loadLocal.restore()
        expect(remoteHostings[0]).to.be.have.any.keys('session', 'connection')
      })
    })

    describe.skip('getRemote', function () {
      it('returns proper response when found hosting', async function () {
        const expectedResult = 'Hosting found'
        hosting.name = getRandomString('hostingClass_getRemote_hosting_name')
        hostingConnection.returns({
          get: () => Promise.resolve(expectedResult)
        })

        const hostingRemote = await hosting.getRemote()

        expect(hostingRemote).to.be.equal(expectedResult)
      })

      it('calls error response when hosting not found and exits', async function () {
        const expectedResult = 'Hosting not found'
        hosting.name = ''
        hostingConnection.returns({
          get: () => Promise.reject(expectedResult)
        })

        await hosting.getRemote()

        sinon.assert.calledOnce(captureException)
        sinon.assert.calledOnce(exitProcess)
      })
    })
  })
})
