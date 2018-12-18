import * as logger from 'debug'
import {parse, stringify} from 'querystring'
import {QueryBuilder} from './query-builder'
import {Hosting, HostingFile, SyncanoResponse} from './types'

const debug = logger('core:hosting')

export class HostingClass extends QueryBuilder {
  /**
   * Get single hosting file.
   *
   * @param hostingName Name of hosting
   * @param fileId Id of file
   */
  public getFile (hostingName: string, fileId: string): Promise<HostingFile> {
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
  public async listFiles (hostingName: string): Promise<HostingFile[]> {
    debug('listFiles')

    try {
      const response: SyncanoResponse<HostingFile> = await this.fetch(
        this.urlFiles(hostingName),
        undefined, {
          'X-API-KEY': this.instance.accountKey
        }
      )

      return this.loadNextFilesPage(response)
    } catch (err) {
      return err
    }
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
  public updateFile (hostingName: string, fileId: string, payload: any): Promise<HostingFile> {
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
      const options = {method: 'DELETE'}

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
  public uploadFile (hostingName: string, payload: any): Promise<HostingFile> {
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

  private async loadNextFilesPage(response: SyncanoResponse<HostingFile>): Promise<HostingFile[]> {
    debug('loadNextFilesPage')

    if (response.next !== null) {
      const next = response.next.replace(/\?.*/, '')
      const nextParams = parse(response.next.replace(/.*\?/, ''))
      const q = stringify(nextParams)
      const nextResponse: SyncanoResponse<HostingFile> = await this.fetch(
        `${this.baseUrl}${next}?${q}`,
        undefined, {
          'X-API-KEY': this.instance.accountKey
        }
      )

      nextResponse.objects = response.objects.concat(nextResponse.objects)

      return await this.loadNextFilesPage(nextResponse)
    }

    return response.objects
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
