import fetch from 'node-fetch'
import crypto from 'crypto'

export default (ctx, syncano) => {
  const {logger, users} = syncano
  const {debug, error} = logger('author')

  const getOrCreateAuthor = (user) => {
    return users
      .where('username', 'eq', user.id)
      .first()
      .then(author => {
        if (!author) {
          debug('Author not found!')
          return users
            .create({
              display_name: user.email,
              username: user.id,
              password: crypto.randomBytes(20).toString('hex')
            })
        }
        return author
      })
  }

  const getOrCreateAPIKey = (user) => {
    debug('getOrCreateAPIKey')
    const url = `https://${ctx.meta.api_host}/v2/instances/${ctx.meta.instance}/api_keys/`
    debug('url', url)
    return fetch(url,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': ctx.meta.token
        }
      })
    .then(rawResp => {
      debug(rawResp.status)
      return rawResp.json()
    })
    .then(resp => {
      let apiKey = null
      resp.objects.forEach(key => {
        if (key.description === 'Registry Users') {
          apiKey = key
        }
      })
      if (!apiKey) {
        error('No API key found!')
      }
      return apiKey['api_key']
    })
  }

  return {
    getOrCreateAPIKey,
    getOrCreateAuthor
  }
}
