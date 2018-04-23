import QueryBuilder from './query-builder'

export interface Socket {
  name: string
  description: string
  created_at: string
  updated_at: string
  version: string
  status: string
  status_info: any
  install_url: any
  metadata: {
    name: string
    keywords: string[]
    sources: {
      [x: string]: string
    }
  }
  config: object,
  installed: {
    endpoints: {
      [endpointName: string]: {
        script: string
        runtime: string
      }
    }
    classes: {
      [className: string]: {
        [fieldName: string]: string
      }
    }
  }
  files: {
    [fileName: string]: {
        checksum: string
        size: number
        file: string
        helper: boolean
    }
  }
  environment: string,
  links: {
    self: string
    update: string
    endpoints: string
    handlers: string
    zip_file: string
  }
}

/**
 * Connection between Sockets.
 */
export default class SocketClass extends QueryBuilder {
  /**
   * Get Syncano Socket configuration.
   *
   * @param socketName Name of socket to fetch
   */
  public get (socketName: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      this.fetch(this.url(socketName), {}, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  /**
   * Delete Syncano Socket
   *
   * @param socketName Name of socket to delete
   */
  public delete (socketName: string): Promise<void> {
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

  /**
   * Get list of Syncano Sockets in current instance
   */
  public list (): Promise<{
    next: string|null
    prev: string|null
    objects: Socket[]
  }> {
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
      return `${this.getSyncanoURL()}/instances/${instanceName}/sockets/${socketName}/`
    }

    return `${this.getSyncanoURL()}/instances/${instanceName}/sockets/`
  }
}
