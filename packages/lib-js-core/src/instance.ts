import {QueryBuilder} from './query-builder'
import {Instance, InstanceMetadata} from './types'

export class InstanceClass extends QueryBuilder {
  /**
   * Create Syncano instance
   *
   * @param params.name Name of Syncano instance
   * @param params.description Description of Syncano instance
   * @param params.metadata Instance metadata. `icon` and `color` properties are used in Syncano Dashboard for Instance
   *                        looks customisation. You can add your own properties too.
   */
  public create (params: {
    name: string,
    description?: string
    metadata?: InstanceMetadata
  }): Promise<Instance> {
    const fetch = this.nonInstanceFetch.bind(this)

    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      const options = {
        body: JSON.stringify(params),
        method: 'POST'
      }
      fetch(this.url(), options, headers)
        .then(resolve)
        .catch(reject)
    })
  }
  /**
   * Get Syncano instance details
   *
   * @param instanceName Name of instance to fetch.
   */
  public get (instanceName: string): Promise<Instance> {
    const fetch = this.nonInstanceFetch.bind(this)

    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      fetch(this.url(instanceName, 'v3'), {}, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  /**
   * List Syncano instances
   */
  public list (): Promise<{
    next: string|null
    prev: string|null
    objects: Instance[]
  }> {
    const fetch = this.nonInstanceFetch.bind(this)

    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      fetch(this.url(undefined, 'v3'), {}, headers)
        .then((res: any) => resolve(res.objects))
        .catch(reject)
    })
  }

  /**
   * Delete Syncano instance
   *
   * @param instanceName Name of instance to delete.
   */
  public delete (instanceName: string): Promise<void> {
    const fetch = this.nonInstanceFetch.bind(this)

    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      const options = {
        method: 'DELETE'
      }
      fetch(this.url(instanceName), options, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  private url (instanceName?: string, apiVersion?: string) {
    const baseUrl = `${this.getSyncanoURL(apiVersion)}/instances/`
    return instanceName ? `${baseUrl}${instanceName}/` : baseUrl
  }
}
