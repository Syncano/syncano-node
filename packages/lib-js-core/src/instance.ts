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

    return fetch(this.url(), {
      body: JSON.stringify(params),
      method: 'POST'
    }, {
      'X-API-KEY': this.instance.accountKey
    })
  }
  /**
   * Get Syncano instance details
   *
   * @param instanceName Name of instance to fetch.
   */
  public get (instanceName: string): Promise<Instance> {
    const fetch = this.nonInstanceFetch.bind(this)

    return fetch(this.url(instanceName, 'v3'), {}, {
      'X-API-KEY': this.instance.accountKey
    })
  }

  /**
   * List Syncano instances
   */
  public async list (): Promise<Instance[]> {
    const fetch = this.nonInstanceFetch.bind(this)

    const resp = await fetch(this.url(undefined, 'v3'), {}, {
      'X-API-KEY': this.instance.accountKey
    })
    return resp.objects
  }

  /**
   * Delete Syncano instance
   *
   * @param instanceName Name of instance to delete.
   */
  public delete (instanceName: string): Promise<void> {
    const fetch = this.nonInstanceFetch.bind(this)

    return fetch(this.url(instanceName), {
      method: 'DELETE'
    }, {
      'X-API-KEY': this.instance.accountKey
    })
  }

  private url (instanceName?: string, apiVersion?: string) {
    return instanceName ?
      `${this.getInstanceURL(instanceName, apiVersion)}/` :
      `${this.getSyncanoURL(apiVersion)}/instances/`
  }
}
