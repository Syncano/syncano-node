import QueryBuilder from './query-builder'

/**
 * Connection between Sockets.
 * @property {Function}
 * @example {@lang javascript}
 * const socket = await socket.get('socketName')
 */
export default class Socket extends QueryBuilder {
  url (socketName) {
    const {instanceName} = this.instance
    if (socketName) {
      return `${this._getSyncanoURL()}/instances/${instanceName}/sockets/${socketName}/`
    }
    return `${this._getSyncanoURL()}/instances/${instanceName}/sockets/`
  }

  get (socketName) {
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      this.fetch(this.url(socketName), {}, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  delete (socketName) {
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      const options = {
        method: 'DELETE'
      }
      this.fetch(this.url(socketName), options, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  list () {
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      this.fetch(this.url(), {}, headers)
        .then(resolve)
        .catch(reject)
    })
  }
}
