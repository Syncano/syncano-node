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
    self: string
    admins: string
    snippets: string
    endpoints: string
    push_notification: string
    classes: string
    invitations: string
    api_keys: string
    triggers: string
    schedules: string
    users: string
    groups: string
    channels: string
    batch: string
    rename: string
    backups: string
    restores: string
    hosting: string
    'classes-acl': string
    'channels-acl': string
    'script-endpoints-acl': string
    'groups-acl': string
    'users-schema': string
    'triggers-emit': string
    sockets: string
    'sockets-install': string
    environments: string
    [x: string]: string
  }
}

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

export default InstanceClass
