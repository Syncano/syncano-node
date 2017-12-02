import path from 'path'
import format from 'chalk'
import { echo, echon } from '../utils/print-tools'

export default class ComponentLink {
  constructor (context) {
    this.session = context.session
    this.Socket = context.Socket
    this.Component = context.Component
  }

  async run ([projectPath, cmd]) {
    const sockets = await this.Socket.listLocal()
    const prints = sockets.map(async socket => {
      const components = await this.Socket.getLocal(socket).getComponents()
      return components.forEach(async component => {
        echon(4)(`Linking component ${format.cyan.bold(component.packageName)}...`)
        component.linkWithProject(path.join(process.cwd(), projectPath))
        echo(format.green(' Done'))
      })
    })
    await Promise.all(prints)
    echo()
  }
}
