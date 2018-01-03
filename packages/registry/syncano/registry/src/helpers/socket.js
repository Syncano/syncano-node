import semver from 'semver'
import Syncano from '@syncano/core'

export default (ctx, syncano) => {
  const {data, logger} = Syncano(ctx)
  const {debug} = logger('socket.js')

  const getSocket = socketName => {
    return data.socket
      .where('name', 'eq', socketName)
      .with('author')
      .with('keywords')
      .first()
      .catch(() => {
        return null
      })
  }

  const findSocket = socketName => {
    debug('findSocket', socketName)
    return data.socket
      .where('name', 'eq', socketName)
      .orderBy('created_at', 'desc')
      .with('author')
      .with('keywords')
      .firstOrFail()
  }

  const findSocketVersion = (socketName, version) => {
    debug('findSocketVersion', [socketName, version])
    return data.socket
      .where('name', 'eq', socketName)
      .where('version', 'eq', version)
      .with('author')
      .with('keywords')
      .firstOrFail()
  }

  const doesSocketVersionExist = () => {
    return new Promise((resolve, reject) => {
      findSocketVersion(ctx.args.name, ctx.args.version)
        .then((socket) => {
          reject(new Error('Socket in this version already exist!'))
        })
        .catch(() => {
          resolve(false)
        })
    })
  }

  const getSocketLastVersion = () => {
    return new Promise((resolve, reject) => {
      findSocket(ctx.args.name)
        .then((socket) => {
          resolve(socket)
        })
        .catch(() => {
          resolve(null)
        })
    })
  }

  const checkSocketOwentship = (user, socket) => {
    return socket.owner_account === user.id
  }

  const checkVersion = (currentVersion, newVersion) => {
    return semver.gt(newVersion, currentVersion)
  }

  return {
    getSocket,
    findSocket,
    findSocketVersion,
    doesSocketVersionExist,
    getSocketLastVersion,
    checkSocketOwentship,
    checkVersion
  }
}
