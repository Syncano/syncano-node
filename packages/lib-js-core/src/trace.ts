import QueryBuilder from './query-builder'

/**
 * Socket endpoints traces.
 */
export default class Trace extends QueryBuilder {
  public get (socketName: string, endpointName: string, traceId: string) {
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      this.fetch(this.url(socketName, endpointName, traceId), {}, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  public list (socketName: string, endpointName: string) {
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      this.fetch(this.url(socketName, endpointName), {}, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  private url (socketName: string, endpointName: string, traceId?: string) {
    const {instanceName} = this.instance
    const instanceUrl = `${this.getSyncanoURL()}/instances/${instanceName}`

    if (traceId) {
      return `${instanceUrl}/endpoints/sockets/${socketName}/${endpointName}/traces/${traceId}`
    }

    return `${this.getSyncanoURL()}/instances/${instanceName}/endpoints/sockets/${socketName}/${endpointName}/traces/`
  }
}
