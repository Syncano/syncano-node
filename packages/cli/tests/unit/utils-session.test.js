/* global it describe afterEach beforeEach */
import fs from 'fs'
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import dirtyChai from 'dirty-chai'
import chai from 'chai'
import format from 'chalk'
import path from 'path'
import mkdirp from 'mkdirp'
import Promise from 'bluebird'

import { getRandomString } from '@syncano/test-tools'

import session from '../../src/utils/session'
import printTools from '../../src/utils/print-tools'
import Init from '../../src/utils/init'
import Plugins from '../../src/utils/plugins'
import getSettings from '../../src/settings'
import AccountSettings from '../../src/settings/accountSettings'

sinon.test = sinonTestFactory(sinon)

chai.use(dirtyChai)
const { expect } = chai

describe('[utils] Session', function () {
  const instanceName = getRandomString('session_instanceName')
  let interEcho = null
  let interEchon = null
  let echo = null
  let error = null
  let exitProcess = null
  let findProjectPathStub = null

  beforeEach(function () {
    interEcho = sinon.stub()
    interEchon = sinon.stub()
    echo = sinon.stub(printTools, 'echo').callsFake((content) => interEcho)
    sinon.stub(printTools, 'echon').callsFake((content) => interEchon)
    error = sinon.stub(printTools, 'error')
    exitProcess = sinon.stub(process, 'exit')
  })

  afterEach(function () {
    interEcho.reset()
    interEchon.reset()
    printTools.echo.restore()
    printTools.echon.restore()
    printTools.error.restore()
    process.exit.restore()
  })

  describe('getSpaceHost', function () {
    it('should return proper host', function () {
      session.project = { instance: instanceName }

      const expectedHostURL = `${instanceName}.${session.ENDPOINT_HOST}`
      const spaceHostResult = session.getSpaceHost()

      expect(spaceHostResult).to.equal(expectedHostURL)
    })
  })

  describe('getInitInstance', function () {
    it('should create new init instance', function () {
      const init = session.getInitInstance()

      expect(init).to.be.instanceof(Init)
    })
  })

  describe('getPluginsInstance', function () {
    it('should create new plugins instance', function () {
      const plugins = session.getPluginsInstance()

      expect(plugins).to.be.instanceof(Plugins)
    })
  })

  describe('getBaseURL', function () {
    it('should contain host', function () {
      const hostingUrl = session.getBaseURL()
      const host = session.getHost()

      expect(hostingUrl).to.contain(host)
    })
  })

  describe('getHost', function () {
    it('should return proper host', function () {
      const expectedHost = 'api.syncano'
      const sessionHost = session.getHost()

      expect(sessionHost).to.contain(expectedHost)
    })
  })

  describe('getDistPath', function () {
    it('should return path to .dist folder', sinon.test(function () {
      const testPath = '/Users/Syncano/cli-test/'
      const pathJoin = this.stub(path, 'join').returns(`${testPath}.dist`)
      const mkDirp = this.stub(mkdirp, 'sync')
      session.projectPath = testPath
      session.getDistPath()

      sinon.assert.calledWith(mkDirp, `${testPath}.dist`)
      sinon.assert.calledWith(pathJoin, testPath)
    }))
  })

  describe.skip('createInstance', function () {
    let syncanoInstance = null

    beforeEach(function () {
      syncanoInstance = sinon.stub(session.connection.Instance, 'please')
    })

    afterEach(function () {
      session.connection.Instance.please.restore()
    })

    it('should print created instance name', sinon.test(async function () {
      syncanoInstance.returns({
        create: () => Promise.resolve({ name: getRandomString('session_createInstance_instanceName') })
      })

      const newInstance = await session.createInstance()

      sinon.assert.calledWith(interEcho, `Syncano Instance ${format.cyan(newInstance.name)} has been created!`)
    }))

    it('should return instance object', async function () {
      const newInstanceName = getRandomString('session_createConnection_newInstanceName')
      syncanoInstance.returns({
        create: () => Promise.resolve({ name: newInstanceName })
      })

      const newInstance = await session.createInstance()

      expect(newInstance).to.be.eql({ name: newInstanceName })
    })

    it('should print error message if promise rejected', async function () {
      const errorMessage = getRandomString('session_createConnection_errorMessage')
      syncanoInstance.returns({
        create: () => Promise.reject(new Error(errorMessage))
      })

      await session.createInstance()

      sinon.assert.calledWith(error, errorMessage)
    })

    it('should exit process if promise rejected', async function () {
      syncanoInstance.returns({
        create: () => Promise.reject(new Error('Error'))
      })

      await session.createInstance()

      sinon.assert.calledOnce(exitProcess)
    })
  })

  describe.skip('getInstance', function () {
    let syncanoInstance = null

    beforeEach(function () {
      syncanoInstance = sinon.stub(session.connection.Instance, 'please')
      session.project = { instance: instanceName }
    })

    afterEach(function () {
      syncanoInstance.restore()
    })

    it('should return instance details if promise resolve', async function () {
      const sampleInstance = {
        name: 'test-instance',
        description: '',
        role: '',
        owner: {
          id: 321321,
          email: 'a@a.com',
          is_active: true
        }
      }
      syncanoInstance.returns({
        get: () => Promise.resolve(sampleInstance)
      })

      const instance = await session.getInstance()

      expect(instance).to.eql(sampleInstance)
    })

    it('should return false if promise reject', async function () {
      syncanoInstance.returns({
        get: () => Promise.reject(new Error('Error'))
      })

      const instance = await session.getInstance()

      expect(instance).to.equal(false)
    })
  })

  describe('checkConnection', function () {
    let getInstance = null

    beforeEach(function () {
      session.project = { instance: instanceName }
      getInstance = sinon.stub(session, 'getInstance')
    })

    afterEach(function () {
      getInstance.restore()
    })

    it('should return connection details if instance exists', async function () {
      const connectionDetails = {
        name: 'test-instance',
        description: '',
        role: '',
        owner: {
          id: 321321,
          email: 'a@a.com',
          is_active: true
        }
      }
      getInstance.returns(connectionDetails)

      const instance = await session.checkConnection()

      expect(instance).to.be.eql(connectionDetails)
    })

    describe('with parameter', function () {
      it('should print proper error message and exit process when instance does not exists', async function () {
        const instance = getRandomString()
        getInstance.returns(false)

        await session.checkConnection(instance)

        sinon.assert.calledWith(interEcho, `Instance ${format.cyan(instance)} was not found on your account!`)
        sinon.assert.calledOnce(exitProcess)
      })
    })

    describe('without parameter', function () {
      it('should print proper error message and exit process when instance does not exists', async function () {
        getInstance.returns(false)

        await session.checkConnection()

        sinon.assert.calledWith(interEcho, `Instance ${format.cyan(instanceName)} was not found on your account!`)
        // eslint-disable-next-line max-len
        sinon.assert.calledWith(interEcho, `Type ${format.cyan('syncano-cli attach')} to choose one of the existing instances.`)
        sinon.assert.calledOnce(exitProcess)
      })
    })
  })

  describe.skip('getInstances', function () {
    let syncanoInstance = null

    beforeEach(function () {
      syncanoInstance = sinon.stub(session.connection.Instance, 'please')
    })

    afterEach(function () {
      session.connection.Instance.please.restore()
    })

    it('should return list of instances', async function () {
      const instancesList = [
        { name: getRandomString('session_getInstances_instancesList[0]_name') },
        { name: getRandomString('session_getInstances_instancesList[1]_name') }
      ]
      syncanoInstance.returns({
        list: () => Promise.resolve(instancesList)
      })

      const instances = await session.getInstances()

      expect(instances).to.be.eql(instancesList)
    })
  })

  describe.skip('checkAuth', function () {
    let getUserDetails = null

    beforeEach(function () {
      getUserDetails = sinon.stub(session.connection.Account, 'getUserDetails')
    })

    afterEach(function () {
      session.connection.Account.getUserDetails.restore()
    })

    it('should return user details if exist', async function () {
      const userTestDetails = {
        name: 'test-user'
      }
      getUserDetails.returns(userTestDetails)

      const auth = await session.checkAuth()

      expect(auth).to.be.resolved // eslint-disable-line
    })

    it('should be rejeceted when no user datails provided', function () {
      getUserDetails.returns()

      const auth = session.checkAuth()

      return expect(auth).be.rejected // eslint-disable-line
    })
  })

  describe('load', function () {
    let existsSync = null
    const thisPath = getRandomString('session_load_thisPath')

    beforeEach(function () {
      findProjectPathStub = sinon.stub(
        session.constructor, 'findProjectPath').returns(Promise.resolve([])
      )
      existsSync = sinon.stub(fs, 'existsSync')
      sinon.stub(path, 'join').returns(thisPath)
    })

    afterEach(function () {
      session.constructor.findProjectPath.restore()
      fs.existsSync.restore()
      path.join.restore()
      session.projectPath = undefined
    })

    it('should set proper project path when first syncano.yml found', async function () {
      const expectedSyncanoDir = getRandomString('session_load_expectedSyncanoDir')
      findProjectPathStub.returns(Promise.resolve(expectedSyncanoDir))

      await session.load()

      expect(session.projectPath).to.equal(expectedSyncanoDir)
    })

    it('should set project path when syncano.yml found in syncano folder', async function () {
      findProjectPathStub.returns(Promise.resolve(thisPath))

      await session.load()

      expect(session.projectPath).to.equal(thisPath)
    })

    it('should set project path when syncano.yml found in current folder', async function () {
      findProjectPathStub.returns(Promise.resolve(process.cwd()))

      await session.load()

      expect(session.projectPath).to.equal(process.cwd())
    })

    it('should set settings when project path set', async function () {
      existsSync.withArgs('syncano.yml').returns(true)

      await session.load()

      expect(session.settings).to.eql(getSettings(session.projectPath))
    })

    it('should set project when project path set', async function () {
      const expectedResult = getRandomString('session_load_expectedResult')
      sinon.stub(AccountSettings.prototype, 'getProject').returns(expectedResult)
      existsSync.withArgs('syncano.yml').returns(true)

      await session.load()

      AccountSettings.prototype.getProject.restore()
      expect(session.project).to.eql(expectedResult)
    })

    it('should call connection', async function () {
      const createConnection = sinon.stub(session, 'createConnection')
      existsSync.withArgs(thisPath).returns(true)

      await session.load()

      session.createConnection.restore()
      sinon.assert.calledOnce(createConnection)
    })

    it('should set settings without project path when error occurs', async function () {
      findProjectPathStub.returns(Promise.reject(new Error('Error')))

      await session.load()

      expect(session.settings).to.eql(getSettings())
    })
  })

  describe('loadPlugins', function () {
    it('should call plugins load function with passed parameters', function () {
      const loadStub = sinon.stub(Plugins.prototype, 'load').callsFake(() => 0)
      const args = [
        getRandomString('session_loadPlugins_args[0]'),
        getRandomString('session_loadPlugins_args[1]')
      ]

      session.loadPlugins(args[0], args[1])

      Plugins.prototype.load.restore()
      sinon.assert.calledWith(loadStub, args[0], args[1])
    })
  })

  describe('isAuthenticated', function () {
    let authenticationStub = null

    beforeEach(function () {
      authenticationStub = sinon.stub(session.settings.account, 'authenticated')
    })

    afterEach(function () {
      session.settings.account.authenticated.restore()
    })

    it('should print message about missing login information', function () {
      const expectedMessage = `Type ${format.cyan('syncano-cli login')} for login to your account.`
      authenticationStub.returns(false)

      session.isAuthenticated()

      sinon.assert.calledWith(interEcho, expectedMessage)
    })

    it('should not print message when account authenticated', function () {
      authenticationStub.returns(true)

      session.isAuthenticated()

      sinon.assert.notCalled(interEcho)
    })

    it('should call exit process when user is not logged it', function () {
      authenticationStub.returns(false)

      session.isAuthenticated()

      sinon.assert.calledOnce(exitProcess)
    })
  })

  describe('isAuthenticatedToInit', function () {
    let authenticationStub = null

    beforeEach(function () {
      authenticationStub = sinon.stub(session.settings.account, 'authenticated')
    })

    afterEach(function () {
      session.settings.account.authenticated.restore()
    })

    it('should print message about missing login information', function () {
      const expectedMessage = format.red('You have to be a logged in to be able an initialize a new project!')
      authenticationStub.returns(false)

      session.isAuthenticatedToInit()

      sinon.assert.calledWith(interEcho, expectedMessage)
    })

    it('should not print message when account authenticated', function () {
      authenticationStub.returns(true)

      session.isAuthenticatedToInit()

      sinon.assert.notCalled(interEcho)
    })
  })

  describe('hasProject', function () {
    it('should print message about missing project if no project path exists', function () {
      const expectedMessage = `I don't see any project here. Try ${format.cyan('syncano-cli init')}.`
      session.projectPath = null
      session.project = null

      session.hasProject()

      sinon.assert.calledWith(interEcho, expectedMessage)
    })

    it('should call exit process if no project path exists', function () {
      session.projectPath = null
      session.project = { instance: getRandomString('session_hasProject_session_project[0]') }

      session.hasProject()

      sinon.assert.calledOnce(exitProcess)
    })

    it('should print message about not attached project', function () {
      const expectedMessage = 'You have to attach this project to one of your instances.'
      session.project = null

      session.hasProject()

      sinon.assert.calledWith(interEcho, expectedMessage)
    })

    it('should call exit process if no project exists', function () {
      session.projectPath = '/Users/Syncano/cli-test/'
      session.project = null

      session.hasProject()

      sinon.assert.calledOnce(exitProcess)
    })

    it('should not print any messages when both project path and project are setup', function () {
      session.project = { instance: getRandomString('session_hasProject_session_project[1]') }
      session.projectPath = '/Users/Syncano/cli-test/'

      session.hasProject()

      sinon.assert.notCalled(interEcho)
    })
  })

  describe('hasSocket', function () {
    const reasonResponse = 'File socket.yml was not found in a project directory!'
    // eslint-disable-next-line max-len
    const solutionResponse = `Check your directory or try ${format.cyan('syncano-cli create')} to create a new Socket.`

    it('should print reason response with proper padding if socket.yml does not exists', function () {
      session.hasSocket(getRandomString('session_hasSocket_socketName[0]'))

      sinon.assert.calledWith(echo, 4)
      sinon.assert.calledWith(interEcho, reasonResponse)
    })

    it('should print solution response with proper padding if socket.yml does not exists', function () {
      session.hasSocket(getRandomString('session_hasSocket_socketName[1]'))

      sinon.assert.calledWith(echo, 4)
      sinon.assert.calledWith(interEcho, solutionResponse)
    })

    it('should call exit process if socket.yml does not exists', function () {
      session.hasSocket(getRandomString('session_hasSocket_socketName[2]'))

      sinon.assert.calledOnce(exitProcess)
    })

    it.skip('should not print any response with if socket.yml does not exists', sinon.test(function () {
      // TODO: find the way to stub Socket contructor
      session.hasSocket(getRandomString('session_hasSocket_socketName[3]'))

      sinon.assert.notCalled(interEcho)
    }))
  })

  describe('notAlreadyInitialized', function () {
    it('should print instanceInformation about project if exists', function () {
      const instanceInformation = `It is using ${format.cyan(instanceName)} Syncano instance.`
      session.project = { instance: instanceName }

      session.notAlreadyInitialized()

      sinon.assert.calledWith(interEcho, instanceInformation)
    })

    it('should call exit process when project exists', function () {
      session.project = { instance: instanceName }

      session.notAlreadyInitialized()

      sinon.assert.calledOnce(exitProcess)
    })

    it('should not print any information if no project exists', function () {
      session.project = null
      session.projectPath = null

      session.notAlreadyInitialized()

      sinon.assert.notCalled(echo)
    })
  })
})
