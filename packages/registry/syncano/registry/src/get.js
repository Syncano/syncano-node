import Syncano from '@syncano/core'
import socket from './helpers/socket'

export default function run (ctx) {
  const syncano = new Syncano(ctx)
  const {response, logger} = syncano
  const {debug} = logger('get.js')

  const {findSocket, findSocketVersion} = socket(ctx, syncano)

  const responseObj = {}
  const version = ctx.args.version
  const name = ctx.args.name

  const fetch = () => {
    debug('fetch')
    const getSocket = () => {
      if (!version) {
        debug('No version, searching only by name:', name)
        return findSocket(name)
      } else {
        debug('Searching with version:', name, '-', version)
        return findSocketVersion(name, version)
      }
    }

    return getSocket()
      .then(socket => {
        debug('Socket found:', socket.name)
        responseObj.name = socket.name
        responseObj.version = socket.version
        responseObj.description = socket.description
        responseObj.url = socket.zip_file
        responseObj.icon = socket.icon
        responseObj.official = socket.official
        responseObj.private = socket.private
        responseObj.config = socket.config || {}
        responseObj.author = socket.author.display_name

        if (socket.keywords) {
          responseObj.keywords = socket.keywords.map(keyword => keyword.name)
        }

        // return socket
        debug('Response:', responseObj)
        return response.json(responseObj)
      })
      .catch(err => {
        debug('Error:', err.message)
        if (err.message === 'No results for given query.') {
          return response({message: 'No such socket!'}, 404)
        } else if (err.message) {
          response.json({message: err.message}, 400)
        }
      })
  }
  return fetch()
}
