import * as logger from 'debug'
import QueryBuilder from './query-builder'

const debug = logger('core:hosting')

export interface File {
  id: number
  path: string
  size: number
  checksum: string
  links: {
    self: string
    [x: string]: string
  }
}

export interface Hosting {
  name: string
  is_default: boolean
  description: string
  created_at: string
  updated_at: string
  domains: string[]
  is_active: boolean
  ssl_status: string
  auth: object
  config: {
    browser_router: boolean
  }
  links: {
    self: string
    files: string
    set_default: string
    enable_ssl: string
    [x: string]: string
  }
}

export default class HostingClass extends QueryBuilder {
  /**
   * Get single hosting file.
   *
   * @param hostingName Name of hosting
   * @param fileId Id of file
   */
  public getFile (hostingName: string, fileId: string): Promise<File> {
    debug('getFile')
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      this.fetch(this.urlFiles(hostingName, fileId), {}, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  /**
   * Get list of files in given hosting
   * @param hostingName Name of hosting
   */
  public listFiles (hostingName: string): Promise<{
    next: string|null
    prev: string|null
    objects: File[]
  }> {
    debug('listFiles')
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      this.fetch(this.urlFiles(hostingName), {}, headers)
        .then((res) => resolve(res.objects))
        .catch(reject)
    })
  }

  /**
   * Get single hosting configuration
   * @param hostingName Name of hosting
   */
  public get (hostingName: string): Promise<Hosting> {
    debug('get')
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      this.fetch(this.url(hostingName), {}, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  /**
   * Update hosting file
   *
   * @param hostingName Name of hosting
   * @param fileId Id of hosting
   * @param payload File payload
   */
  public updateFile (hostingName: string, fileId: string, payload: any): Promise<File> {
    debug('updateFile')
    return new Promise((resolve, reject) => {
      const headers = payload.getHeaders()
      headers['X-API-KEY'] = this.instance.accountKey

      const options = {
        body: payload,
        method: 'PATCH'
      }

      this.fetch(this.urlFiles(hostingName, fileId), options, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  /**
   * Delete hosting file
   *
   * @param hostingName Name of hosting
   * @param fileId Id of hosting
   * @param payload File payload
   */
  public deleteFile (hostingName: string, fileId: string): Promise<void> {
    debug('deleteFile')
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      const options = { method: 'DELETE' }

      this.fetch(this.urlFiles(hostingName, fileId), options, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  /**
   * Upload new file to hosting
   *
   * @param hostingName Name of hosting
   * @param fileId Id of hosting
   * @param payload File payload
   */
  public uploadFile (hostingName: string, payload: any): Promise<File> {
    debug('uploadFile')
    return new Promise((resolve, reject) => {
      const headers = payload.getHeaders()
      headers['X-API-KEY'] = this.instance.accountKey

      const options = {
        body: payload,
        method: 'POST'
      }

      this.fetch(this.urlFiles(hostingName), options, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  private urlFiles (hostingName: string, fileId?: string) {
    const {instanceName} = this.instance

    if (fileId) {
      return `${this.getSyncanoURL()}/instances/${instanceName}/hosting/${hostingName}/files/${fileId}/`
    }

    return `${this.getSyncanoURL()}/instances/${instanceName}/hosting/${hostingName}/files/`
  }

  private url (hostingName: string) {
    const {instanceName} = this.instance

    if (hostingName) {
      return `${this.getSyncanoURL()}/instances/${instanceName}/hosting/${hostingName}/`
    }

    return `${this.getSyncanoURL()}/instances/${instanceName}/hosting/`
  }
}
