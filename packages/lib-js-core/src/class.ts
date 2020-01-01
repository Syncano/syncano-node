import {QueryBuilder} from './query-builder'
import {SchemaObject, SyncanoClass} from './types'

export class Class extends QueryBuilder {
  public url (className?: string, apiVersion?: string) {
    const {instanceName} = this.instance
    const baseUrl = `${this.getInstanceURL(instanceName, apiVersion)}/classes/`

    return className ? `${baseUrl}${className}/` : baseUrl
  }

  /**
   * Create Syncano Class
   *
   * @param params.name Data Class name - max 64 characters.
   * @param params.description Data Class description
   * @param params.metadata Additional JSON metadata associated with the Class
   * @param params.schema Data Class schema. It defines the Data Objects that
   *                      will be created within the Data Class. `type` (i.e. string)
   *                      and `name` are required fields. The very basic schema would
   *                      look like this: [{"type": "string", "name": "parameter_name"}]
   */
  public create (params: {
    name: string
    description?: string
    schema?: SchemaObject[]
    metadata?: object
  }): Promise<SyncanoClass> {
    const fetch = this.fetch.bind(this)

    return fetch(this.url(), {
      body: JSON.stringify(params),
      method: 'POST'
    })
  }

  /**
   * Delete Syncano Class
   */
  public delete (className: string): Promise<void> {
    const fetch = this.fetch.bind(this)

    return fetch(this.url(className), {
      method: 'DELETE'
    })
  }

  /**
   * Get single Syncano Class details
   */
  public async get (className: string): Promise<SyncanoClass> {
    const fetch = this.fetch.bind(this)
    const resp = await fetch(this.url(className, 'v3'), {
      method: 'GET'
    })

    return resp
  }

  /**
   * List Syncano Classes
   */
  public async list (): Promise<SyncanoClass[]> {
    const fetch = this.fetch.bind(this)
    const resp = await fetch(this.url(undefined, 'v3'), {})

    return resp.objects
  }
}

export default Class
