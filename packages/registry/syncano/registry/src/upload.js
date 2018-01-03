import Syncano from '@syncano/core'
import auth from './helpers/auth'
import author from './helpers/author'

export default (ctx) => {
  const syncano = Syncano(ctx)
  const {response, logger, data} = syncano
  const {debug, error} = logger('upload')

  const {authUser} = auth(ctx, syncano)
  const {getOrCreateAuthor, getOrCreateAPIKey} = author(ctx, syncano)

  const scope = {}

  return authUser()
    .then(user => {
      debug(`Authenticated Syncano user: ${user.id}`)

      scope.user = user
      return getOrCreateAuthor(user)
    })
    .then(author => {
      debug('Author found')
      debug(author)
      scope.author = author
      return getOrCreateAPIKey()
    })
    .then(apiKey => {
      debug('APIKey found')
      debug(apiKey)
      scope.apiKey = apiKey

      const dataObjectACL = {}
      dataObjectACL['users'] = {}
      dataObjectACL['users'][scope.author.id] = ['write']

      debug('dataObjectACL')
      debug(dataObjectACL)

      return data.storage.create({acl: dataObjectACL, owner: scope.author.id})
    })
    .then(storageObject => {
      debug('storageObject created')
      debug(storageObject)

      response.json({
        method: 'PATCH',
        url: [
          `${storageObject.links.self}`,
          `?api_key=${scope.apiKey}&user_key=${scope.author['user_key']}`
        ].join('')
      })
    })
    .catch(err => {
      if (err.response) {
        err.response.text()
         .then(resp => {
           error(resp)
         })
      } else {
        console.log(err)
      }
    })
}
