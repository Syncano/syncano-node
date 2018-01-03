import Syncano from '@syncano/core'
import auth from './helpers/auth'

export default (ctx) => {
  const syncano = Syncano(ctx)
  const {response, logger, data} = syncano
  const {debug} = logger('search')

  const {getUser} = auth(ctx, syncano)
  const keyword = ctx.args.keyword
  const allSocketsDict = {}
  const responseObj = {}
  let socketsGroupsStore = null
  let userObj = null

  const getSocketDetails = (socket) => {
    debug(`Getting details for socket: ${socket.name}`)
    debug(socket)
    responseObj.name = socket.name
    responseObj.author = socket.author.display_name
    responseObj.version = socket.version
    responseObj.description = socket.description
    responseObj.url = socket.url
    responseObj.official = socket.official
    responseObj.private = socket.private
    responseObj.keywords = socket.keywords ? socket.keywords.map(keyword => keyword.name) : []

    debug(`Socket keywords: ${responseObj.keywords}`)
    debug(socket.keywords)
    return getUser()
      .then(user => {
        debug('Author', user)
        if (user) {
          // comparing strings with int
          responseObj.is_mine = socket.author.username === user.id
        }
        return responseObj
      })
  }

  const fetch = () => {
    debug('Searching for sockets')
    // We are searching in a name, description and keywords
    // We want to have only last version, because of that we have "orderBy"
    return Promise.all([
      data.socket
        .where('name', 'icontains', keyword)
        .orderBy('version', 'asc')
        .with('author')
        .with('keywords')
        .list(),
      data.socket
        .where('description', 'contains', keyword)
        .orderBy('version', 'asc')
        .with('author')
        .with('keywords')
        .list(),
      data.socket
        .where('keywords', 'is', {name: {_eq: keyword}})
        .orderBy('version', 'asc')
        .with('author')
        .with('keywords')
        .list()
    ])
    .then(socketGroups => {
      debug('socketGroups', socketGroups.length)
      socketsGroupsStore = socketGroups
      return getUser()
    })
    .then(user => {
      userObj = user
      socketsGroupsStore.forEach(group => {
        debug(`Found ${group.length} sockets in a group`)
        group.forEach(socket => {
          // That way we will have always newest version on top
          if (!socket.private || (userObj && socket.owner_account === userObj.id)) {
            allSocketsDict[socket.name] = socket
          }
        })
      })

      const detailProms = []

      Object.keys(allSocketsDict).forEach(socket => {
        detailProms.push(getSocketDetails(allSocketsDict[socket]))
      })

      return Promise.all(detailProms)
    })
    .then(sockets => {
      debug('sockets', sockets)

      if (sockets.length === 0) {
        return response.json({message: 'No sockets found!'}, 404)
      }
      return response.json(sockets)
    })
    .catch(err => {
      response.json({message: err.message}, 400)
    })
  }

  return fetch()
}
