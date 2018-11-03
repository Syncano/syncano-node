import logger from 'debug'
import QueryBuilder from './query-builder'

const debug = logger('core:hosting')

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
    debug('getFile')
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      this.fetch(this.urlFiles(hostingId, fileId), {}, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  async listFiles (hostingId) {
    debug('listFiles')
    try {
    return  await this.request(this.urlFiles(hostingId))
    } catch(err) {
      throw err
    }
  }

  async request (url) {
    debug('request')
    const headers = {
      'X-API-KEY': this.instance.accountKey
    }
    try {
      let result = await this.fetch(url, {}, headers)
      let objects = result.objects
      objects = await this.loadNextPage(result, objects)
      return objects
    } catch (err) {
      throw err
    }
  }

  async loadNextPage (response , objects) {
    debug('loadNextPage')
    let hasNextPageMeta = response.next
    try {
      if (hasNextPageMeta) {
        const nextObjects =  await this.request(`${this.baseUrl}${hasNextPageMeta}`)
        return objects.concat(nextObjects)
      }
    return objects
    } catch(err) {
      throw err
    }
  }

  get (hostingId) {
    debug('get')
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
    debug('updateFile')
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

  deleteFile (hostingId, fileId) {
    debug('deleteFile')
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      const options = { method: 'DELETE' }

      this.fetch(this.urlFiles(hostingId, fileId), options, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  uploadFile (hostingId, payload) {
    debug('uploadFile')
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
