import logger from '../utils/debug'
import { echo } from '../utils/print-tools'
import { socketNotFound } from './helpers/socket'
import { printInstanceInfo } from './helpers/instance'
import responses from './socket-list-responses'

const { info, debug } = logger('cmd-socket-list')

class SocketListCmd {
  constructor (context) {
    info('SocketListCmd.constructor')
    debug(context)
    this.session = context.session
    this.Socket = context.Socket
    this.responses = responses(this.session)
  }

  async run ([socketName, cmd]) {
    info('SocketListCmd.run')
    this.fullPrint = cmd.full || !!socketName

    echo()
    printInstanceInfo(this.session)

    if (socketName) {
      try {
        const socket = await this.Socket.get(socketName)
        if (!socket.existLocally && !socket.existRemotely) {
          socketNotFound()
          process.exit(1)
        }
        echo()
        this.printSocket(socket)
      } catch (err) {
        socketNotFound()
        process.exit(1)
      }
    } else {
      const sockets = await this.Socket.list()
      this.printSockets(sockets)
    }
  }

  printEndpoint (endpoint) {
    const endpointResponses = this.responses.endpoint(endpoint)
    echo(8)(endpointResponses.name)
    echo(8)(endpointResponses.description)
    echo(8)(endpointResponses.url)
    if (!endpoint.existRemotely) {
      echo(8)(endpointResponses.notSynced)
    }
    echo()

    if (endpoint.metadata.parameters && this.fullPrint) {
      echo(8)(this.responses.params)
      echo()
      Object.keys(endpoint.metadata.parameters).forEach((param) => {
        echo(10)(endpointResponses.parameter(param).name)
        echo(10)(endpointResponses.parameter(param).description)
        echo(10)(endpointResponses.parameter(param).example)
        echo()
      })
    }

    const responses = endpoint.metadata.response

    if (responses && this.fullPrint) {
      echo(8)(this.responses.responses)
      echo()
      if (responses) {
        Object.keys(responses).forEach(exampleKey => {
          const example = responses[exampleKey]
          echo(10)(endpointResponses.response(example).description)
          echo(10)(endpointResponses.response(example).mimetype)
          echo(10)(endpointResponses.response(example).exitCode)
          echo(10)(endpointResponses.response(example).example)
          echo()
        })
      }
    }
  }

  printEventHandler (eventHandler) {
    const metadata = eventHandler.metadata
    const handlerResponses = this.responses.handler(eventHandler)

    echo(8)(handlerResponses.name)
    echo(8)(handlerResponses.description)
    echo()

    if (metadata.parameters && this.fullPrint) {
      echo(12)(this.responses.params)
      echo()
      Object.keys(metadata.parameters).forEach((param) => {
        echo(12)(handlerResponses.parameter(param).name)
        echo(12)(handlerResponses.parameter(param).description)
        echo(12)(handlerResponses.parameter(param).example)
        echo()
      })
    }
  }

  printEvent (event) {
    const eventResponses = this.responses.event(event)

    echo(8)(eventResponses.name)
    echo(8)(eventResponses.description)
    echo()

    if (event.metadata.parameters && this.fullPrint) {
      echo(12)(this.responses.params)
      echo()
      Object.keys(event.metadata.parameters).forEach((param) => {
        echo(12)(eventResponses.parameter(param).name)
        echo(12)(eventResponses.parameter(param).description)
        echo(12)(eventResponses.parameter(param).example)
        echo()
      })
    }
  }

  async printSocket (socket) {
    info('printSocket')

    const endpoints = socket.getEndpoints()
    const eventHandlers = socket.getEventHandlers()
    const events = socket.getEvents()

    echo(4)(this.responses.socket(socket).name)
    echo(4)(this.responses.socket(socket).description)
    echo(4)(this.responses.socket(socket).version)
    echo(4)(this.responses.socket(socket).type)
    echo(4)(this.responses.socket(socket).status)
    echo()

    endpoints.forEach((endpoint) => this.printEndpoint(endpoint))
    eventHandlers.forEach((eventHandler) => this.printEventHandler(eventHandler))
    events.forEach((event) => this.printEvent(event))
  }

  printSockets (sockets) {
    echo()
    if (!sockets || sockets.length === 0) {
      echo(4)(this.responses.lackSockets)
      echo(4)(this.responses.createNewOne)
      echo(4)(this.responses.installNewOne)
      echo()

      return process.exit()
    }

    sockets.forEach((socket) => this.printSocket(socket))
    echo()
  }
}

export default SocketListCmd
