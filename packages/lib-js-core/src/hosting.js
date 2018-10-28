import logger from 'debug'
import QueryBuilder from './query-builder'
import querystring from 'querystring'

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
    const headers = {
      'X-API-KEY': this.instance.accountKey
    }
    let results = []
    const initialFetch = await this.fetch(this.urlFiles(hostingId), {}, headers)
    const hasNext = initialFetch.next;
    results = results.concat(initialFetch.objects.slice(0))
    results = await this.fetchNextListFiles(hasNext, results)
    return new Promise((resolve, reject) => {
      resolve(results)
      .catch(reject)
    })
  }

  async fetchNextListFiles(hasNext, results){
    debug('fetchNextListFiles')
    const headers = {
      'X-API-KEY': this.instance.accountKey
    }
    if (hasNext) {
      const nextParams = querystring.parse(hasNext.replace(/.*\?/, ''))
      const q = querystring.stringify(...nextParams)
      const next = nextParams.replace(/\?.*/, '');
      const url = `${this.baseUrl}${next}?${q}`
      const nextFetch = await this.fetch(url, {}, headers)
      await this.fetchNextListFiles(nextFetch.next, results)

    return results.concat(nextFetch.objects.slice(0))
    }
    else {
      return results
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
