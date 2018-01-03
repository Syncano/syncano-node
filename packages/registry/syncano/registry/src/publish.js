import Syncano from '@syncano/core'
import auth from './helpers/auth'

export default (ctx) => {
  const syncano = Syncano(ctx)
  const {response, logger, data} = syncano
  const {debug} = logger('publish')

  const {authUser} = auth(ctx, syncano)

  const version = ctx.args.version
  const name = ctx.args.name

  let userObj = null
  let socketObj = null

  const fetch = () => {
    const getSocket = () => {
      if (!version) {
        debug('No version, searching only by name:', name)
        return data.socket
          .where('name', 'eq', name) // eslint-disable-line no-undef
          .orderBy('id', 'desc')
          .firstOrFail()
      } else {
        debug('Searching with version:', name, '-', version)
        return data.socket
          .where('name', 'eq', name) // eslint-disable-line no-undef
          .where('version', 'eq', version) // eslint-disable-line no-undef
          .firstOrFail()
      }
    }

    getSocket()
    .then((socket) => {
      socketObj = socket
      return authUser()
    })
    .then(user => {
      userObj = user
      debug('User found:', userObj)
      debug('Socket found:', socketObj.name)
      debug(socketObj)
      if (!socketObj.private) {
        return response.json({message: 'This socket is not private!'}, 400)
      }
      if (userObj.id !== socketObj.owner_account) {
        return response.json({message: 'This socket does not belong to you!'}, 400)
      }
      return data.socket.update(socketObj.id, { private: false })
    })
    .then(resp => {
      console.log(resp)
    })
    .catch(err => {
      if (err.message === 'No results for given query.') {
        response('No such socket!', 404)
      } else {
        response.json({message: err.message}, 400)
      }
    })
  }

  return fetch()
}
