import QueryBuilder from './query-builder'
import {ACL} from './types'

export interface ClassResponse {
  name: string
  description: string
  schema: SchemaObject[]
  status: string
  created_at: string
  updated_at: string
  objects_count: number
  revision: number
  acl: ACL
  metadata: object
  links: {
    self: string
    objects: string
    'endpoint-acl': string
    [x: string]: string
  }
}

export interface SchemaObject {
  name: string
  type: 'reference'|'relation'|'text'|'string'|'file'|'object'|'array'|'geopoint'|'integer'|'float'|'boolean'|'datetime'
  order_index?: boolean
  filter_index?: boolean
  unique?: boolean
  target?: string
}

export class Class extends QueryBuilder {
  public url (className?: string) {
    const {instanceName} = this.instance
    const baseUrl = `${this.getInstanceURL(instanceName)}/classes/`

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
  }): Promise<ClassResponse> {
    const fetch = this.fetch.bind(this)

    return new Promise((resolve, reject) => {
      const options = {
        body: JSON.stringify(params),
        method: 'POST'
      }

      fetch(this.url(), options)
        .then(resolve)
        .catch(reject)
    })
  }

  /**
   * Delete Syncano Class
   */
  public delete (className: string): Promise<void> {
    const fetch = this.fetch.bind(this)

    return new Promise((resolve, reject) => {
      const options = {
        method: 'DELETE'
      }

      fetch(this.url(className), options)
        .then(resolve)
        .catch(reject)
    })
  }
}

export default Class
