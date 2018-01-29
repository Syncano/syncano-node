/* global describe it beforeEach afterEach before */
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import { expect } from 'chai'
import format from 'chalk'

import { getRandomString } from '@syncano/test-tools'

import { SocketList } from '../../src/commands'
import context from '../../src/utils/context'
import printTools from '../../src/utils/print-tools'

sinon.test = sinonTestFactory(sinon)

describe('[commands] List Sockets', function () {
  const socketList = new SocketList(context)
  const descSocket0 = `description1_${getRandomString('createSocket_sockets[0]_description')}`
  const status = { status: 'not synced', type: 'fail' }
  const type = { msg: 'project dependency', type: 'ok' }
  const sockets = [
    {
      name: `${getRandomString('createSocket_sockets[0]_name')}`,
      remote: {
        spec: {
          description: descSocket0
        }
      },
      spec: {
        description: descSocket0
      },
      existRemotely: true,
      existLocally: true,
      getEndpoints: () => 'Endpoints got',
      getEventHandlers: () => [],
      getEvents: () => {},
      getStatus: () => status,
      getType: () => type
    },
    {
      name: `name2_${getRandomString('createSocket_sockets[1]_name')}`,
      remote: { spec: {} },
      local: {
        spec: {
          description: `description2_${getRandomString('createSocket_sockets[1]_description')}`
        }
      },
      existRemotely: false,
      existLocally: false
    }
  ]
  const instance = getRandomString('createSocket_instance')
  const socketName = getRandomString('createSocket_socket')
  const socketId = getRandomString('createSocket_socketId')
  const endpointName = getRandomString('createSocket_endpoints[0]_name')

  const endpoints = [{
    name: endpointName,
    description: getRandomString('createSocket_endpoints[0]_description'),
    allowed_methods: [getRandomString('createSocket_endpoints[0]_allowed_methods')],
    links: { self: `/v2/instances/${instance}/endpoints/sockets/${socketName}/${socketId}/` },
    metadata: {},
    getURL: () => `https://${instance}/${socketName}/${endpointName}/`,
    getStatus: () => '',
    getFullName: () => `${socketName}/${endpointName}`
  }]
  let interEcho = null

  beforeEach(function () {
    interEcho = sinon.stub()
    sinon.stub(printTools, 'echo').callsFake((content) => interEcho)
    sinon.stub(socketList.session, 'load')
    sinon.stub(process, 'exit')
  })

  afterEach(function () {
    interEcho.reset()
    printTools.echo.restore()
    socketList.session.load.restore()
    process.exit.restore()
  })

  describe('run', function () {
    let printSockets = null
    let printSocket = null

    beforeEach(function () {
      printSockets = sinon.stub(socketList, 'printSockets')
      printSocket = sinon.stub(socketList, 'printSocket')
    })

    afterEach(function () {
      socketList.printSockets.restore()
      socketList.printSocket.restore()
    })

    it('should set fullPrint flag to true if socket name is specified', sinon.test(async function () {
      this.stub(socketList.Socket, 'get').withArgs(sockets[0].name).returns(Promise.resolve(sockets[0]))

      await socketList.run([sockets[0].name, {}])

      return expect(socketList.fullPrint).to.be.true
    }))

    it('should set fullPrint flag to false if socket name is not specified', sinon.test(async function () {
      this.stub(socketList.Socket, 'list').returns(Promise.resolve(sockets))

      await socketList.run([undefined, {}])

      return expect(socketList.fullPrint).to.be.false
    }))

    it('should call printSocket method with proper parameters for single socket', sinon.test(async function () {
      const socket = sockets[0]
      socketList.socketName = socket.name
      this.stub(socketList.Socket, 'get').withArgs(socket.name).returns(Promise.resolve(socket))

      await socketList.run([socket.name, {}])

      sinon.assert.calledWith(printSocket, socket)
    }))

    it('should call printSockets method with proper parameters for collection of sockets', sinon.test(async function () {
      socketList.socketName = null
      this.stub(socketList.Socket, 'list').returns(Promise.resolve(sockets))

      await socketList.run([null, {}])

      sinon.assert.calledWith(printSockets, sockets)
    }))
  })

  describe('printSockets', function () {
    let printSocket = null

    beforeEach(function () {
      printSocket = sinon.stub(socketList, 'printSocket')
    })

    afterEach(function () {
      socketList.printSocket.restore()
    })

    it('should print info and exit process if any socket were not specified on server nor in config', function () {
      socketList.printSockets([])

      sinon.assert.calledWith(interEcho, 'No Socket was found on server nor in config!')
      sinon.assert.calledWith(interEcho, `Type ${format.cyan('syncano-cli create <name>')} to create new one.`)
    })

    it('should call printSocket with proper parameter for each socket', function () {
      socketList.printSockets(sockets)

      sockets.forEach((socket) => {
        sinon.assert.calledWith(printSocket, socket)
      })
    })
  })

  describe('printSocket', function () {
    it('should print socket name, description and status', sinon.test(async function () {
      const socket = Object.create(sockets[0])

      this.stub(socket, 'getEndpoints').returns([])
      this.stub(socket, 'getEventHandlers').returns([])
      this.stub(socket, 'getEvents').returns([])
      this.stub(socketList, 'printEndpoint')

      await socketList.printSocket(socket)

      sinon.assert.calledWith(interEcho, `${format.cyan.bold('socket')}: ${format.cyan.bold(socket.name)}`)

      sinon.assert.calledWith(
        interEcho,
        `${format.dim('description')}: ${socket.spec.description}`
      )
      sinon.assert.calledWithMatch(interEcho, socket.getStatus().status)
    }))

    it.skip('should print lack socket info without socketname', async function () {
      const socket = Object.create(sockets[1])
      socket.name = false

      await socketList.printSocket(socket)

      sinon.assert.calledWith(interEcho, 'This Socket was not found on server nor in config!')
    })

    it.skip('should print lack socket info with socketname', async function () {
      const socket = Object.create(sockets[1])

      await socketList.printSocket(socket)

      sinon.assert.calledWith(interEcho, `${format.yellow(socket.name)} was not found on server nor in config!`)
    })
  })

  describe('printEndpoint', function () {
    const endpoint = endpoints[0]

    beforeEach(function () {
      sinon.stub(socketList.session, 'getSpaceHost').returns(instance)
      socketList.printEndpoint(endpoint)
    })

    afterEach(function () {
      socketList.session.getSpaceHost.restore()
    })

    describe('should print endpoint', function () {
      it('name', function () {
        sinon.assert.calledWith(interEcho,
        `${format.white('endpoint')}: ${format.cyan(endpoint.getFullName())}`)
      })

      it('description', function () {
        sinon.assert.calledWith(interEcho,
        `${format.dim('description')}: ${endpoint.metadata.description || ''}`)
      })

      it('url', sinon.test(function () {
        const endpointUrl = `https://${instance}/${socketName}/${endpoint.name}/`
        sinon.assert.calledWith(interEcho,
        `${format.dim('url')}: ${endpointUrl}`)
      }))
    })

    describe('should print endpoint params with', function () {
      let param = null

      before(function () {
        endpoint.metadata.parameters = {
          parameter: {
            description: getRandomString('createSocket_printEndpoint_parameter_description'),
            example: getRandomString('createSocket_printEndpoint_parameter_example')
          }
        }
        param = Object.keys(endpoint.metadata.parameters)[0]
        socketList.fullPrint = true
      })

      beforeEach(function () {
        socketList.printEndpoint(endpoint)
      })

      it('name', function () {
        sinon.assert.calledWith(interEcho,
        `${format.dim('name')}: ${format.cyan(param) || ''}`)
      })

      it('description', function () {
        sinon.assert.calledWith(interEcho,
        `${format.dim('description')}: ${endpoint.metadata.parameters[param].description || ''}`)
      })

      it('example', function () {
        sinon.assert.calledWith(interEcho,
        `${format.dim('example')}: ${format.cyan.dim(endpoint.metadata.parameters[param].example)}`)
      })
    })
  })
})
