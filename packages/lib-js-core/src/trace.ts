import {QueryBuilder} from './query-builder'
import {Trace} from './types'

export class TraceClass extends QueryBuilder {
  /**
   * Get single endpoint trace object.
   *
   * @param socketName Name of traced socket
   * @param endpointName Name of traced endpoint
   * @param traceId Id of trace object
   */
  public get (socketName: string, endpointName: string, traceId?: string): Promise<Trace> {
    return this.fetch(this.url(socketName, endpointName, traceId), {}, {
      'X-API-KEY': this.instance.accountKey
    })
  }

  /**
   * Get single endpoint trace object.
   *
   * @param socketName Name of traced socket
   * @param endpointName Name of traced endpoint
   */
  public list (socketName: string, endpointName: string): Promise<{
    next: string|null
    prev: string|null
    objects: Trace[]
  }> {
    return this.fetch(this.url(socketName, endpointName), {}, {
      'X-API-KEY': this.instance.accountKey
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
