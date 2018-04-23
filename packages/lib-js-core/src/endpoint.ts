import QueryBuilder from './query-builder'

/**
 * Running endpoints.
 */
export default class Endpoint extends QueryBuilder {
  public post (endpoint: string, body = {}, options = {}) {
    const fetch = this.fetch.bind(this)

    return fetch(this._url(endpoint), {
      body: this._parseBody(body),
      method: 'POST',
      ...options
    })
  }

  public get (endpoint: string, data = {}, options = {}) {
    return this.post(endpoint, {...data, _method: 'GET'}, options)
  }

  public delete (endpoint: string, data = {}, options = {}) {
    return this.post(endpoint, {...data, _method: 'DELETE'}, options)
  }

  public put (endpoint: string, data = {}, options = {}) {
    return this.post(endpoint, {...data, _method: 'PUT'}, options)
  }

  public patch (endpoint: string, data = {}, options = {}) {
    return this.post(endpoint, {...data, _method: 'PATCH'}, options)
  }

  private _url (endpoint: string) {
    const {instanceName, spaceHost} = this.instance

    return `https://${instanceName}.${spaceHost}/${endpoint}/`
  }

  private _parseBody (body: any) {
    const isBodyAnObject = typeof body === 'object'

    return isBodyAnObject ? JSON.stringify({...body}) : body
  }
}
