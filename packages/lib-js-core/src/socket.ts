import QueryBuilder from './query-builder'

/**
 * Connection between Sockets.
 *
 * @example {@lang javascript}
 * const socket = await socket.get('socketName')
 */
export default class Socket extends QueryBuilder {
  public get (socketName: string) {
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      this.fetch(this.url(socketName), {}, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  public delete (socketName: string) {
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

  public list () {
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      this.fetch(this.url(), {}, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  private url (socketName?: string) {
    const {instanceName} = this.instance

    if (socketName) {
      return `${this._getSyncanoURL()}/instances/${instanceName}/sockets/${socketName}/`
    }

    return `${this._getSyncanoURL()}/instances/${instanceName}/sockets/`
  }
}
