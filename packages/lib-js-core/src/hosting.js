import QueryBuilder from './query-builder'

/**
 * Hosting related operations.
 * @property {Function}
 * @example {@lang javascript}
 * const mytrace = await trace.get('my-socket', 'my-endpoint', 1234)
 */
export default class Hosting extends QueryBuilder {
  url (hostingId) {
    const {instanceName} = this.instance
    if (hostingId) {
      return `${this._getSyncanoURL()}/instances/${instanceName}/hosting/${hostingId}/`
    }
    return `${this._getSyncanoURL()}/instances/${instanceName}/hosting/`
  }

  urlFiles (hostingId, fileId) {
    const {instanceName} = this.instance
    if (fileId) {
      return `${this._getSyncanoURL()}/instances/${instanceName}/hosting/${hostingId}/files/${fileId}/`
    }
    return `${this._getSyncanoURL()}/instances/${instanceName}/hosting/${hostingId}/files/`
  }

  getFile (hostingId, fileId) {
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      this.fetch(this.urlFiles(hostingId, fileId), {}, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  listFiles (hostingId) {
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      this.fetch(this.urlFiles(hostingId), {}, headers)
        .then(resp => {
          resolve(resp.objects)
        })
        .catch(reject)
    })
  }

  get (hostingId) {
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      this.fetch(this.url(hostingId), {}, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  updateFile (hostingId, fileId, payload) {
    return new Promise((resolve, reject) => {
      const headers = payload.getHeaders()
      headers['X-API-KEY'] = this.instance.accountKey

      const options = {
        method: 'PATCH',
        body: payload
      }

      this.fetch(this.urlFiles(hostingId, fileId), options, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  uploadFile (hostingId, payload) {
    return new Promise((resolve, reject) => {
      const headers = payload.getHeaders()
      headers['X-API-KEY'] = this.instance.accountKey

      const options = {
        method: 'POST',
        body: payload
      }

      this.fetch(this.urlFiles(hostingId), options, headers)
        .then(resolve)
        .catch(reject)
    })
  }
}
