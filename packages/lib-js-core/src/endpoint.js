import QueryBuilder from './query-builder'

/**
 * Running endpoints.
 * @property {Function}
 * @example {@lang javascript}
 * const latestTags = await socket.get('tags/list', { sort: 'latest' })
 * const createdTag = await socket.post('tags/create', { name: 'nature' })
 */
export default class Endpoint extends QueryBuilder {
  post (endpoint, body = {}, options = {}) {
    const fetch = this.fetch.bind(this)

    return fetch(this._url(endpoint), {
      method: 'POST',
      body: this._parseBody(body),
      ...options
    })
  }

  get (endpoint, data = {}, options = {}) {
    return this.post(endpoint, {...data, _method: 'GET'}, options)
  }

  delete (endpoint, data = {}, options = {}) {
    return this.post(endpoint, {...data, _method: 'DELETE'}, options)
  }

  put (endpoint, data = {}, options = {}) {
    return this.post(endpoint, {...data, _method: 'PUT'}, options)
  }

  patch (endpoint, data = {}, options = {}) {
    return this.post(endpoint, {...data, _method: 'PATCH'}, options)
  }

  _url (endpoint) {
    const {instanceName, spaceHost} = this.instance

    return `https://${instanceName}.${spaceHost}/${endpoint}/`
  }

  _parseBody (body) {
    const isBodyAnObject = typeof body === 'object'

    return isBodyAnObject ? JSON.stringify({...body}) : body
  }
}
