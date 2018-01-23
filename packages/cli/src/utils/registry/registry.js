import fs from 'fs'
import path from 'path'

import logger from '../debug'
import session from '../session'

const { debug } = logger('utils-registry')

class Registry {
  async searchSocketByName (name, version) {
    debug(`searchSocketByName: ${name} ${version}`)
    return session.connection.registry.searchSocketByName(name, version)
  }

  static getSocket (socket) {
    debug('getSocket')

    const fileName = path.join(session.getBuildPath(), `${socket.name}.zip`)
    const fileDescriptor = fs.createWriteStream(fileName)

    return session.connection.registry.getSocket(socket.url, fileDescriptor)
  }

  async publishSocket (socketName, version) {
    debug(`publishSocket: ${socketName}, ${version}`)
    return session.connection.registry.publishSocket(socketName, version)
  }

  async searchSocketsByAll (keyword) {
    debug(`searchSocketsByAll: ${keyword}`)
    return session.connection.registry.searchSocketsByAll(keyword)
  }

  async submitSocket (socket) {
    debug(`submitSocket: ${socket.name}`)
    await socket.createPackageZip()

    return session
      .connection
      .registry
      .submitSocket(socket.spec, socket.getFullConfig(), socket.getSocketZip())
  }
}

export default Registry
