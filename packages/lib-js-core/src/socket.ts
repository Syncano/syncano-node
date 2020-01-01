import {QueryBuilder} from './query-builder'
import {Socket} from './types'

/**
 * Connection between Sockets.
 */
export class SocketClass extends QueryBuilder {
  /**
   * Get Syncano Socket configuration.
   *
   * @param socketName Name of socket to fetch
   */
  public get (socketName: string): Promise<Socket> {
    return this.fetch(this.url(socketName), {}, {
      'X-API-KEY': this.instance.accountKey
    })
  }

  /**
   * Delete Syncano Socket
   *
   * @param socketName Name of socket to delete
   */
  public delete (socketName: string): Promise<void> {
    return this.fetch(this.url(socketName), {
      method: 'DELETE'
    }, {
      'X-API-KEY': this.instance.accountKey
    })
  }

  /**
   * Get list of Syncano Sockets in current instance
   */
  public list (): Promise<{
    next: string|null
    prev: string|null
    objects: Socket[]
  }> {
    return this.fetch(this.url(), {}, {
      'X-API-KEY': this.instance.accountKey
    })
  }

  private url (socketName?: string) {
    const {instanceName} = this.instance
    const instanceUrl = this.getInstanceURL(instanceName)

    if (socketName) {
      return `${instanceUrl}/sockets/${socketName}/`
    }

    return `${instanceUrl}/sockets/`
  }
}
