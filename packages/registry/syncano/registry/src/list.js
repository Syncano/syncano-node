import _ from 'lodash'

import Syncano from '@syncano/core'

export default (ctx) => {
  const syncano = Syncano(ctx)
  const {response, logger, data} = syncano
  const {debug} = logger('list')

  const socketsResp = []

  return data.socket
    .orderBy('created_at', 'DESC')
    .with('author')
    .fields(
      'id',
      'created_at',
      'icon',
      'owner_account',
      'keywords',
      'name',
      'private',
      'author.display_name',
      'author.id',
      'version',
      'config',
      'description',
      'url')
    .list()
    .then((sockets) => {
      debug(sockets)
      sockets.forEach((socket, index) => {
        if (!socket.private) {
          if (!_.find(socketsResp, { name: socket.name })) {
            socketsResp.push(socket)
          }
        }
      })
      return response.json(sockets)
    })
    .catch((error) => {
      console.log(error)
      response.json(error, 400)
    })
}
