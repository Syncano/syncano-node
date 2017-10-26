import format from 'chalk'
import { p, printCode } from '../utils/print-tools'

const renderStatus = (object) => {
  const { status, type } = object.getStatus()

  switch (type) {
    case 'ok':
      return format.dim.green(status)
    case 'warn':
      return format.dim.yellow(status)
    case 'fail':
      return format.dim.red(status)
    default:
      return status
  }
}

const socketListResponses = (session) => ({
  lackSockets: 'No Socket was found on server nor in config!',
  lackSocket: ({ name }) => (
    `${name ? format.yellow(name) : 'This Socket'} was not found on server nor in config!`
  ),
  createNewOne: `Type ${format.cyan('syncano-cli create <name>')} to create new one.`,
  installNewOne: `Type ${format.cyan('syncano-cli add <name>')} to install new one from registry.`,
  params: `${format.white('params')}:`,
  socket: (socket) => {
    let description = ''
    if (socket.existRemotely) {
      description = socket.remote.spec.description || ''
    } else {
      description = socket.spec.description || ''
    }

    return {
      name: `${format.cyan.bold('socket')}: ${format.cyan.bold(socket.name)}`,
      description: `${format.dim('description')}: ${description}`,
      version: `${format.dim('version')}: ${socket.spec.version || ''}`,
      type: `${format.dim('type')}: ${socket.getType().msg}`,
      status: `${format.dim('status')}: ${renderStatus(socket)}`
    }
  },
  endpoint: (endpoint) => {
    const metadata = endpoint.metadata

    return endpoint && {
      name: `${format.white('endpoint')}: ${format.cyan(endpoint.getFullName())}`,
      description: `${format.dim('description')}: ${metadata.description || ''}`,
      url: `${format.dim('url')}: ${endpoint.getURL()}`,
      notSynced: `${format.dim('status')}: ${renderStatus(endpoint)}`,
      parameter: (param) => param && ({
        name: `${format.dim('name')}: ${format.cyan(param) || ''}`,
        description: `${format.dim('description')}: ${metadata.parameters[param].description || ''}`,
        example: `${format.dim('example')}: ${format.cyan.dim(metadata.parameters[param].example)}`
      }),
      response: (example) => {
        const { exit_code, description } = example || ''
        let exampleLines = ''
        if (example && example.example) {
          exampleLines = example.example.split('\n').map((line) => p(12)(line)).join('\n')
        }

        return {
          mimetype: `${format.white('response')}: ${metadata.response.mimetype}`,
          description: example && `${format.dim('description')}: ${printCode(exit_code, description)}`,
          exitCode: example && `${format.dim('exit code')}: ${printCode(exit_code)}`,
          example: exampleLines && `${format.dim('example')}:\n${exampleLines}`
        }
      }
    }
  },
  handler: (handler) => {
    const metadata = handler.metadata

    return handler && {
      name: `${format.white('event handler')}: ${format.cyan(handler.name)}`,
      description: `${format.dim('description')}: ${metadata.description || ''}`,
      parameter: (param) => param && ({
        name: `${format.dim('name')}: ${format.cyan(param) || ''}`,
        description: `${format.dim('description')}: ${metadata.parameters[param].description || ''}`,
        example: `${format.dim('example')}: ${format.cyan.dim(metadata.parameters[param].example)}`
      })
    }
  },
  event: (event) => event && {
    name: `${format.white('event')}: ${format.cyan(event.name)}`,
    description: `${format.dim('description')}: ${event.metadata.description || ''}`,
    parameter: (param) => param && ({
      name: `${format.dim('name')}: ${format.cyan(param) || ''}`,
      description: `${format.dim('description')}: ${event.metadata.parameters[param].description || ''}`,
      example: `${format.dim('example')}: ${format.grey(event.metadata.parameters[param].example)}`
    })
  }
})

export default socketListResponses
