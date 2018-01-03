import {find} from 'lodash'
import semver from 'semver'

import Syncano from '@syncano/core'

export default function run (ctx) {
  const syncano = Syncano(ctx)
  const {response, logger, data} = syncano
  const {debug} = logger('add')

  const {getSocketLastVersion, checkSocketOwentship, checkVersion} = require('./helpers/socket').default(ctx, syncano)
  const {authUser} = require('./helpers/auth').default(ctx, syncano)
  const {getOrCreateAuthor} = require('./helpers/author').default(ctx, syncano)
  const {getKeywords} = require('./helpers/keyword').default(ctx, syncano)

  const { name, description, version, icon, url, keywords, config } = ctx.args

  let keywordsArrayStore = null
  let userObj = null
  let authorObj = null

  return authUser()
    .then((user) => {
      userObj = user
      return getSocketLastVersion()
    })
    .then((socketObj) => {
      if (!semver.valid(version)) {
        const message = `Version "${version}" has a wrong format! Check http://semver.org/ for more info.`
        response.json({message}, 400)
        process.exit()
      }

      if (socketObj) {
        if (!checkSocketOwentship(userObj, socketObj)) {
          response.json({message: 'This socket doesn\'t belong to you!'}, 400)
          process.exit()
        }
        if (!checkVersion(socketObj.version, version)) {
          response.json({message: `Wrong version! It should be greater ${socketObj.version}`}, 400)
          process.exit()
        }
      }
      // Let's find keywords (or create them if doesn't exist)
      debug('Provided keywords:', keywords)
    })
    .then(() => {
      return getOrCreateAuthor(userObj)
    })
    .then((author) => {
      debug('Author found/created:')
      debug(author)
      authorObj = author
      return getKeywords(keywords)
    })
    .then(keywordsArray => {
      debug('Socket keywords:', keywordsArray.map((keyword) => keyword.name))
      keywordsArrayStore = keywordsArray
      return data.socket.create({
        name,
        description,
        owner_account: userObj.id,
        version,
        author: authorObj.id,
        private: true,
        url: url,
        config,
        icon,
        keywords: keywordsArray ? keywordsArray.map((keyword) => keyword.id) : []
      })
    })
    .then(socket => {
      debug('Socket created:', socket.name)
      response.json({
        name: socket.name,
        version: socket.version,
        author: authorObj.display_name,
        keywords: socket.keywords
          ? socket.keywords.map(keyword => keyword.name) : []
      })
    })
    .catch(err => {
      response.json({message: err.message}, 400)
    })
}
