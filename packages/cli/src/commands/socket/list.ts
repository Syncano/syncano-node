import {flags} from '@oclif/command'

import Command, {Socket} from '../../base_command'
import {printInstanceInfo} from '../../commands_helpers/instance'
import {socketNotFound} from '../../commands_helpers/socket'
import responses from '../../commands_helpers/socket-list-responses'
import logger from '../../utils/debug'

const {info} = logger('cmd-socket-list')

export default class SocketListCmd extends Command {
  static description = 'List the installed Sockets'
  static flags = {
    full: flags.boolean({char: 'f'}),
  }
  static args = [{
    name: 'socketName',
    description: 'name of the Socket (all if not provided)',
  }]

  responses: any
  fullPrint: any

  async run() {
    info('SocketListCmd.run')
    await this.session.isAuthenticated() || this.exit(1)
    await this.session.hasProject() || this.exit(1)

    const {args} = this.parse(SocketListCmd)
    const {flags} = this.parse(SocketListCmd)

    this.responses = responses()
    const socketName = args.socketName
    this.fullPrint = flags.full || !!socketName

    this.echo()
    printInstanceInfo(this.session)

    if (socketName) {
      try {
        const socket = await Socket.get(socketName)
        if (!socket.existLocally && !socket.existRemotely) {
          socketNotFound()
          this.exit(1)
        }
        this.echo()
        this.printSocket(socket)
      } catch (err) {
        socketNotFound()
        this.exit(1)
      }
    } else {
      try {
        const sockets = await Socket.list()
        this.printSockets(sockets)
      } catch (err) {
        this.exit(1)
      }
    }
    this.exit(0)
  }

  printEndpoint(endpoint) {
    const endpointResponses = this.responses.endpoint(endpoint)
    this.echo(8)(endpointResponses.name)
    this.echo(8)(endpointResponses.description)
    this.echo(8)(endpointResponses.url)
    if (!endpoint.existRemotely) {
      this.echo(8)(endpointResponses.notSynced)
    }
    this.echo()

    if (endpoint.metadata.parameters && this.fullPrint) {
      this.echo(8)(this.responses.params)
      this.echo()
      Object.keys(endpoint.metadata.parameters).forEach(param => {
        this.echo(10)(endpointResponses.parameter(param).name)
        this.echo(10)(endpointResponses.parameter(param).description)
        this.echo(10)(endpointResponses.parameter(param).example)
        this.echo()
      })
    }

    const responses = endpoint.metadata.response

    if (responses && this.fullPrint) {
      this.echo(8)(this.responses.responses)
      this.echo()
      if (responses) {
        Object.keys(responses).forEach(exampleKey => {
          const example = responses[exampleKey]
          this.echo(10)(endpointResponses.response(example).description)
          this.echo(10)(endpointResponses.response(example).mimetype)
          this.echo(10)(endpointResponses.response(example).exitCode)
          this.echo(10)(endpointResponses.response(example).example)
          this.echo()
        })
      }
    }
  }

  printEventHandler(eventHandler) {
    const metadata = eventHandler.metadata
    const handlerResponses = this.responses.handler(eventHandler)

    this.echo(8)(handlerResponses.name)
    this.echo(8)(handlerResponses.description)
    this.echo()

    if (metadata.parameters && this.fullPrint) {
      this.echo(12)(this.responses.params)
      this.echo()
      Object.keys(metadata.parameters).forEach(param => {
        this.echo(12)(handlerResponses.parameter(param).name)
        this.echo(12)(handlerResponses.parameter(param).description)
        this.echo(12)(handlerResponses.parameter(param).example)
        this.echo()
      })
    }
  }

  printEvent(event) {
    const eventResponses = this.responses.event(event)

    this.echo(8)(eventResponses.name)
    this.echo(8)(eventResponses.description)
    this.echo()

    if (event.metadata.parameters && this.fullPrint) {
      this.echo(12)(this.responses.params)
      this.echo()
      Object.keys(event.metadata.parameters).forEach(param => {
        this.echo(12)(eventResponses.parameter(param).name)
        this.echo(12)(eventResponses.parameter(param).description)
        this.echo(12)(eventResponses.parameter(param).example)
        this.echo()
      })
    }
  }

  async printSocket(socket) {
    info('printSocket')

    const endpoints = socket.getEndpoints()
    const eventHandlers = socket.getEventHandlers()
    const events = socket.getEvents()

    this.echo(4)(this.responses.socket(socket).name)
    this.echo(4)(this.responses.socket(socket).description)
    this.echo(4)(this.responses.socket(socket).version)
    this.echo(4)(this.responses.socket(socket).type)
    this.echo(4)(this.responses.socket(socket).status)
    this.echo()

    endpoints.forEach(endpoint => this.printEndpoint(endpoint))
    eventHandlers.forEach(eventHandler => this.printEventHandler(eventHandler))
    events.forEach(event => this.printEvent(event))
  }

  printSockets(sockets) {
    this.echo()
    if (!sockets || sockets.length === 0) {
      this.echo(4)(this.responses.lackSockets)
      this.echo(4)(this.responses.createNewOne)
      this.echo(4)(this.responses.installNewOne)
      this.echo()

      return this.exit()
    }

    sockets.forEach(socket => this.printSocket(socket))
    this.echo()
  }
}
