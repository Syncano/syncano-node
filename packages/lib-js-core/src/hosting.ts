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
    debug('getFile %o', {hostingName, fileId})

    return this.fetch(this.urlFiles(hostingName, fileId), {}, {
      'X-API-KEY': this.instance.accountKey
    })
  }

  /**
   * Get list of files in given hosting
   * @param hostingName Name of hosting
   */
  public async listFiles (hostingName: string): Promise<HostingFile[]> {
    debug('listFiles, %o', {hostingName})

    try {
      const response = await this.fetch(this.urlFiles(hostingName), {}, {
        'X-API-KEY': this.instance.accountKey
      })

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
    debug('get %o', {hostingName})

    return this.fetch(this.url(hostingName), {}, {
      'X-API-KEY': this.instance.accountKey
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
    debug('updateFile %o', {hostingName, fileId})

    const headers = payload.getHeaders()
    headers['X-API-KEY'] = this.instance.accountKey

    return this.fetch(this.urlFiles(hostingName, fileId), {
      body: payload,
      method: 'PATCH'
    }, headers)
  }

  /**
   * Delete hosting file
   *
   * @param hostingName Name of hosting
   * @param fileId Id of hosting
   * @param payload File payload
   */
  public deleteFile (hostingName: string, fileId: string): Promise<void> {
    debug('deleteFile %o', {hostingName, fileId})

    return this.fetch(this.urlFiles(hostingName, fileId), {
      method: 'DELETE'
    }, {
      'X-API-KEY': this.instance.accountKey
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
    debug('uploadFile %o', {hostingName})

    const headers = payload.getHeaders()
    headers['X-API-KEY'] = this.instance.accountKey

    return this.fetch(this.urlFiles(hostingName), {
      body: payload,
      method: 'POST'
    }, headers)
  }

  private async loadNextFilesPage(response: SyncanoResponse<HostingFile>): Promise<HostingFile[]> {
    if (response.next !== null) {
      debug('loadNextFilesPage')

      const next = response.next.replace(/\?.*/, '')
      const nextParams = parse(response.next.replace(/.*\?/, ''))
      const q = stringify(nextParams)
      const nextResponse = await this.fetch(`${this.baseUrl}${next}?${q}`, {}, {
        'X-API-KEY': this.instance.accountKey
      })

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
