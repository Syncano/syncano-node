import Syncano from '@syncano/core'
import auth from './helpers/auth'

export default async (ctx) => {
  const syncano = new Syncano(ctx)
  const {response, logger, data} = syncano
  const {debug} = logger('publish')

  const {authUser} = auth(ctx, syncano)

  const version = ctx.args.version
  const name = ctx.args.name

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

  try {
    const socket = await getSocket()
    const user = await authUser()

    debug('User found:', user)
    debug('Socket found:', socket)
    if (!socket.private) {
      return response.json({message: 'This socket is not private!'}, 400)
    }
    if (user.id !== socket.owner_account) {
      return response.json({message: 'This socket does not belong to you!'}, 400)
    }
    return data.socket.update(socket.id, { private: false })
  } catch (err) {
    if (err.message === 'No results for given query.') {
      return response('No such socket!', 404)
    } else {
      return response.json({message: err.message}, 400)
    }
  }
}
