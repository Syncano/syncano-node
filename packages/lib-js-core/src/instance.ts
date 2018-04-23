import QueryBuilder from './query-builder'

export interface InstanceOwner {
  id: number,
  email: string,
  first_name: string,
  last_name: string,
  is_active: boolean,
  has_password: boolean,
  metadata: InstanceMetadata
}

export interface InstanceMetadata {
  icon?: string
  color?: string
  [x: string]: any
}

export interface Instance {
  name: string,
  description: string,
  owner: InstanceOwner,
  created_at: string,
  updated_at: string,
  role: string,
  metadata: InstanceMetadata,
  links: {
    [x: string]: string
  }
}

class InstanceClass extends QueryBuilder {
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
      fetch(this.url(instanceName), {}, headers)
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
      fetch(this.url(), {}, headers)
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

  private url (instanceName?: string) {
    const baseUrl = `${this.getSyncanoURL()}/instances/`
    return instanceName ? `${baseUrl}${instanceName}/` : baseUrl
  }
}

export default InstanceClass
