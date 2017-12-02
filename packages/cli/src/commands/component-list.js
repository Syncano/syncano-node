import format from 'chalk'
import logger from '../utils/debug'
import { echo } from '../utils/print-tools'

const { info, debug } = logger('cmd-component-list')

export default class ComponentList {
  constructor (context) {
    this.session = context.session
    this.Socket = context.Socket
    this.Component = context.Component
  }

  async run ([projetPath, cmd]) {
    info('ComponentLink.run')

    const sockets = await this.Socket.listLocal()
    sockets.forEach(async socket => {
      const components = await this.Socket.getLocal(socket).getComponents()
      components.forEach(component => {
        this.printComponent(component)
      })
    })
  }

  async printComponent (component) {
    debug('printComponent')
    const metadata = component.metadata

    echo(4)(`${format.cyan.bold('name')}: ${format.cyan.bold(component.packageName)}`)
    echo(4)(`${format.dim('socket')}: ${component.socketName}`)

    if (metadata.parameters) {
      echo()
      Object.keys(metadata.parameters).forEach(paramName => {
        const paramObj = metadata.parameters[paramName]
        echo(8)(`${format.dim('name')}: ${format.cyan(paramName) || ''}`)
        echo(8)(`${format.dim('description')}: ${paramObj.description}`)
        echo(8)(`${format.dim('example')}: ${paramObj.example}`)
        echo()
      })
    }
    echo()
  }
}
