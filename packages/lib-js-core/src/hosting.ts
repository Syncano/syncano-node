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
  public getFile (hostingId: string, fileId: string) {
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

  public listFiles (hostingId: string) {
    debug('listFiles')
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      this.fetch(this.urlFiles(hostingId), {}, headers)
        .then((res) => resolve(res.objects))
        .catch(reject)
    })
  }

  public get (hostingId: string) {
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

  public updateFile (hostingId: string, fileId: string, payload: any) {
    debug('updateFile')
    return new Promise((resolve, reject) => {
      const headers = payload.getHeaders()
      headers['X-API-KEY'] = this.instance.accountKey

      const options = {
        body: payload,
        method: 'PATCH'
      }

      this.fetch(this.urlFiles(hostingId, fileId), options, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  public deleteFile (hostingId: string, fileId: string) {
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

  public uploadFile (hostingId: string, payload: any) {
    debug('uploadFile')
    return new Promise((resolve, reject) => {
      const headers = payload.getHeaders()
      headers['X-API-KEY'] = this.instance.accountKey

      const options = {
        body: payload,
        method: 'POST'
      }

      this.fetch(this.urlFiles(hostingId), options, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  private urlFiles (hostingId: string, fileId?: string) {
    const {instanceName} = this.instance

    if (fileId) {
      return `${this._getSyncanoURL()}/instances/${instanceName}/hosting/${hostingId}/files/${fileId}/`
    }

    return `${this._getSyncanoURL()}/instances/${instanceName}/hosting/${hostingId}/files/`
  }

  private url (hostingId: string) {
    const {instanceName} = this.instance

    if (hostingId) {
      return `${this._getSyncanoURL()}/instances/${instanceName}/hosting/${hostingId}/`
    }

    return `${this._getSyncanoURL()}/instances/${instanceName}/hosting/`
  }
}
