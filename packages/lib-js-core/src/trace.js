import QueryBuilder from './query-builder'

/**
 * Socket endpoints traces.
 * @property {Function}
 * @example {@lang javascript}
 * const mytrace = await trace.get('my-socket', 'my-endpoint', 1234)
 */
export default class Trace extends QueryBuilder {
  url (socketName, endpointName, traceId) {
    const {instanceName} = this.instance
    if (traceId) {
      return `${this._getSyncanoURL()}/instances/${instanceName}/endpoints/sockets/${socketName}/${endpointName}/traces/${traceId}`
    }
    return `${this._getSyncanoURL()}/instances/${instanceName}/endpoints/sockets/${socketName}/${endpointName}/traces/`
  }

  get (socketName, endpointName, traceId) {
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      this.fetch(this.url(socketName, endpointName, traceId), {}, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  list (socketName, endpointName) {
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      this.fetch(this.url(socketName, endpointName), {}, headers)
        .then(resolve)
        .catch(reject)
    })
  }
}
