import * as logger from 'debug'
import * as FormData from 'form-data'
import * as querystring from 'querystring'
import {MAX_BATCH_SIZE, MAX_COLUMN_IN_VALUES_LOOKUP} from './constants'
import {NotFoundError} from './errors'
import {QueryBuilder} from './query-builder'
import {ClassObject} from './types'
import {chunkArray, objectToFormData} from './utils'
const get = require('lodash.get')
const merge = require('lodash.merge')
const set = require('lodash.set')
const debug = logger('core:data')

type Operator = '<=' | '<' | '>' | '>=' | '!=' | '<>' | '='
  | 'in' | 'nin' | 'contains' | 'exists'
  | 'startswith' | 'endswith' | 'istartswith' | 'iendswith' | 'icontains' | 'ieq'
  | 'eq' | 'neq' | 'gt' | 'lt' | 'lte' | 'gte'

type Fields<T, ClassSchema> = Extract<keyof (T & ClassSchema & ClassObject), string>

export class DataClass<ClassSchema = {
  [fieldName: string]: any
}> extends QueryBuilder {

  [x: string]: any

  // tslint:disable-next-line:variable-name
  private _url?: string

  // TODO: Add better return type
  /**
   * List objects matching query
   */
  public async list<T> (): Promise<Array<T & ClassObject & ClassSchema>> {
    debug('list')
    const self = this
    const urls = [this.url(undefined, 'v3')].concat(this.queries.map((query) => {
      this._query.query = query
      return this.url()
    }))
    debug('list/urls %o', urls)
    const uniqueIds: any[] = []
    const fetches = urls.map(async (url) => self.request(url))

    let results = await Promise.all(fetches)
    results = [].concat.apply([], results)
    results = await self.resolveRelatedModels(results)
    results = await self.replaceCustomTypesWithValue(results)
    results = await self.mapFields(results)

    results.filter(({id}) =>
      uniqueIds.includes(id) ? false : uniqueIds.push(id)
    )

    return results
  }

  /**
   * Get number of objects matching given query
   *
   * @example
   * data.posts.count()
   * data.posts.where('likes', '>', 100).count()
   */
  public async count (): Promise<number> {
    this.withQuery({page_size: 0, include_count: 1})

    const res = await this.fetch(this.url())
    return res.objects_count
  }

  /**
   * Get the minimum value of a given key.
   *
   * @example
   * data.posts.min('likes')
   */
  public async min<T>(column: Fields<T, ClassSchema>): Promise<number | null> {
    const item = await this.orderBy(column, 'ASC').first()
    if (item !== null) {
      return (item as  any)[column]
    }
    return null
   }

  /**
   * Get first element matching query or return null
   *
   * @example
   * data.posts.first()
   * data.posts.where('likes', '>', 100).first()
   */
  public async first (): Promise<ClassObject & ClassSchema | null> {
    const response = await this.take(1).list()

    return response[0] || null
  }

  /**
   * Get first element matching query or throw error
   *
   * @throws {NotFoundError} No results for given query
   * @example
   * try {
   *   data.posts.firstOrFail()
   * } catch (err) {
   *   // Handle not found post
   * }
   */
  public async firstOrFail (): Promise<ClassObject & ClassSchema> {
    let object

    try {
      object = await this.first()
    } catch (err) {
      throw new NotFoundError()
    }
    if (!object) {
      throw new NotFoundError()
    }

    return object
  }

  /**
   * Get the first record matching the attributes or create it
   *
   * @param {Object} attributes Parameters used to find object
   * @param values Parameters used to create object if not found
   * @example
   * data.tags.firstOrCreate({name: 'dogs'}, {firstUsedBy: 'authorID'})
   */
  public firstOrCreate<T, I> (
    attributes: T & ClassSchema,
    values?: I & ClassSchema
  ): Promise<T & I & ClassObject & ClassSchema> {
    const query = this.toWhereArray(attributes)

    return this.where(query)
      .firstOrFail()
      .catch(() => this.create(merge(attributes, values || {})))
  }

  /**
   * Create or update a record matching the attributes, and fill it with values
   */
  public async updateOrCreate<T> (
    attributes: T & ClassSchema,
    values: T extends FormData ? FormData : T & ClassSchema
  ): Promise<T & ClassObject & ClassSchema> {
    const query = this.toWhereArray(attributes)

    try {
      const res = await this.where(query).firstOrFail()
      return this.update(res.id, values)
    } catch (err) {
      return this.create(merge(attributes, values))
    }
  }

  public async find (id: number): Promise<ClassObject & ClassSchema | null>
  public async find (id: number[]): Promise<Array<ClassObject & ClassSchema>>
  /**
   * Get single object by ID
   *
   * @param ids Single object ID
   * @example
   * data.posts.find(1)
   */
  public async find (id: any): Promise<any> {
    debug('find', id)

    if (Array.isArray(id)) {
      return this.findMany(id)
    }

    return this.where('id', '=', id).first()
  }

  /**
   * Find multiple object by ID.
   *
   * @param ids Array of IDs
   * @example
   * data.posts.findMany([1, 2])
   */
  public async findMany (ids: number[]): Promise<Array<ClassObject & ClassSchema>> {
    debug('findMany', ids)

    if (Array.from(ids).length === 0) {
      return []
    }

    return this.where('id', 'in', ids).list()
  }

  public async findOrFail<T> (ids: number): Promise<ClassObject & ClassSchema>
  public async findOrFail<T> (ids: number[]): Promise<Array<ClassObject & ClassSchema>>
  /**
   * Same as `find` method but throws error for no results
   *
   * @param ids Single object ID or array of IDs
   * @throws {NotFoundError} No results for given query
   * @example
   * data.posts.findOrFail(1) // returns single object
   * data.posts.findOrFail([1, 2]) // returns array of objects
   */
  public async findOrFail<T> (ids: any): Promise<any> {
    try {
      const response  = await this.find(ids)
      const shouldThrow = Array.isArray(response) && Array.isArray(ids)
        ? response.length !== ids.length
        : response === null

      if (shouldThrow) {
        throw new NotFoundError()
      }

      return response as ClassObject & ClassSchema
    } catch (err) {
      throw new NotFoundError()
    }
  }

  /**
   * Set number of objects to get
   *
   * @param number Number of objects
   */
  public take (count: number) {
    return this.withQuery({limit: count, page_size: Math.min(this.query.page_size || 500, count)})
  }

  /**
   * Set order of fetched objects
   *
   * @param {string} column Name of class column
   * @param {string} direction Direction of order. Can be `ASC`(default) or `DESC`
   */
  public orderBy<T> (
    column: Fields<T, ClassSchema>,
    direction: 'ASC' | 'DESC' = 'ASC'
  ) {
    const dir = direction.toUpperCase()
    const sign = dir === 'DESC' ? '-' : ''

    return this.withQuery({
      order_by: `${sign}${column}`
    })
  }

  // TODO: Add overload for string columns - should handle additional operators like startswith
  public where<T> (
    column: Fields<T, ClassSchema>,
    // tslint:disable-next-line:unified-signatures
    value: string | number | boolean | null
  ): DataClass<ClassSchema>
  public where<T> (
    column: Fields<T, ClassSchema>,
    // tslint:disable-next-line:unified-signatures
    operator: Operator,
    value: any
  ): DataClass<ClassSchema>
  public where<T> (
    // tslint:disable-next-line:unified-signatures
    queries: any[]
  ): DataClass<ClassSchema>
  /**
   * Filter objects
   *
   * @see https://cheatsheet.syncano.io/#server
   * @example
   * data.posts.where('id', 'in', [10, 20]).list()
   * data.posts.where('id', 10).list()
   * data.posts.where('id', '>=', 10).list()
   */
  public where (column: any, operator?: any, value?: any) {
    debug('where %s %o %o', column, operator, value)
    if (Array.isArray(column)) {
      column.map(([itemColumn, itemOperator, itemValue]) =>
        this.where(itemColumn, itemOperator, itemValue)
      )

      return this
    }

    const normalizedOperator = this.normalizeWhereOperator(operator)

    const secondParamIsNull = operator === null && value === undefined
    const isEqualNull = normalizedOperator === '_eq' && value === null
    const lookingForNull = secondParamIsNull || isEqualNull

    let whereOperator = value !== undefined ? `_${normalizedOperator}` : '_eq'
    let whereValue = value === undefined ? normalizedOperator : value

    if (lookingForNull) {
      whereOperator = '_exists'
      whereValue = false
    }

    const currentQuery = JSON.parse(this.query.query || '{}')

    const nextQuery = (column as string)
      .split('.')
      .reverse()
      .reduce((child: any, item: string) => ({
        [item]: Object.keys(child).length === 0
          ? {[whereOperator]: whereValue}
          : {_is: child}
      }), {})
    const query = merge({}, currentQuery, nextQuery)

    return this.withQuery({query: JSON.stringify(query)})
  }

  public orWhere<T> (
    column: Fields<T, ClassSchema>,
    // tslint:disable-next-line:unified-signatures
    operator: Operator,
    value: any
  ): DataClass<ClassSchema>
  public orWhere<T> (
    column: Fields<T, ClassSchema>,
    // tslint:disable-next-line:unified-signatures
    value: string | number | boolean | null
  ): DataClass<ClassSchema>
  /**
   * Execute "or where" query
   *
   * @example
   * data.posts
   *   .where('likes', '<=', 100)
   *   .orWhere('likes', '>=', 200).list()
   */
  public orWhere (column: any, operator?: any, value?: any) {
    this._queries = [].concat(this.queries as [never], this._query.query)
    this._query.query = null

    return this.where(column, operator, value)
  }

  /**
   * Get object with not null column value
   *
   * @example
   * data.posts.whereNotNull('title').list()
   */
  public whereNotNull<T> (column: Fields<T, ClassSchema>) {
    return this.where(column, 'exists', true)
  }

  /**
   * Get objects where column value is a part of given array or string
   *
   * @example
   * data.posts.whereIn('id', [100, 200]).list()
   */
  public whereIn<T> (column: Fields<T, ClassSchema>, arr: string[] | number[]) {
    return this.where(column, 'in', arr)
  }

  /**
   * Get objects where column value is not a part of given array or string
   *
   * @example
   * data.posts.whereNotIn('id', [10, 20]).list()
   */
  public whereNotIn<T> (column: Fields<T, ClassSchema>, arr: string[] | number[]) {
    return this.where(column, 'nin', arr)
  }

  /**
   * Get objects where column value is null
   *
   * @example
   * data.posts.whereNull('title').list()
   */
  public whereNull<T> (column: Fields<T, ClassSchema>) {
    return this.where(column, null)
  }

  /**
   * Get objects where column value is between given min and max
   *
   * @example
   * data.posts.whereBetween('likes', 100, 200).list()
   */
  public whereBetween<T> (column: Fields<T, ClassSchema>, min: number, max: number) {
    return this.where([
      [column, 'gte', min],
      [column, 'lte', max]
    ])
  }

  // TODO: Add types
  /**
   * Whitelist returned keys
   *
   * @param fields Array of field names to whitelist. Can also be comma separated arguments
   * @example
   * data.posts.fields('title', 'created_at').list()
   * data.posts.fields(['title', 'created_at']).list()
   */
  public fields (...fields: any[]) {
    if (Array.isArray(fields[0])) {
      fields = fields[0]
    }

    const fieldsToMap = fields.map((field) => {
      const [, from, , to] = field.match(/([\w_\-.]*)(\sas\s)?(.*)?/)

      return {[from]: to}
    })

    this.withMappedFields(fieldsToMap)

    return this
  }

  /**
   * Expand references and relationships
   *
   * @example
   * data.posts.with('author').list()
   */
  public with (...models: any[]) {
    const relationships = Array.isArray(models[0]) ? models[0] : models

    return this.withRelationships(relationships)
  }

  /**
   * Get values of single column
   *
   * @example
   * data.posts.pluck('title') // returns array of values
   */
  public async pluck<T> (column: Fields<T, ClassSchema>): Promise<any[]> {
    const items = await this.list()
    return items.map((item: any) => item[column])
  }

  /**
   * Get value of single record column field
   *
   * @example
   * data.posts.where('id', 1).value('created_at') // returns first created_at value
   */
  public async value<T> (column: Fields<T, ClassSchema>): Promise<any> {
    const item = await this.firstOrFail()

    return item[column as any]
  }

  /**
   * Create new object
   *
   * @param body Object or array of objects to create
   * @example
   * data.posts.create({title: 'Lorem ipsum'})
   * data.posts.create([
   *   {title: 'Lorem ipsum'},
   *   {title: 'Dolor sit amet'}
   * ])
   */
  public create<T> (body: T & ClassSchema): Promise<
    T extends any[] ? Array<ClassObject & ClassSchema & T[0]> : ClassObject & ClassSchema & T
  > {
    let headers
    const fetchObject: {
      method: string
      url: string
      body?: any
    } = {
      method: 'POST',
      url: this.url()
    }

    const formBody = body as unknown as FormData
    const isFormData = (formBody) && formBody.constructor && formBody.constructor.name === 'FormData'

    if (isFormData) {
      fetchObject.body = formBody
      headers = formBody.getHeaders()
    } else if (Array.isArray(body)) {
      return this.batch(body)
        .then(this.replaceCustomTypesWithValue.bind(this))
        .then(this.mapFields.bind(this))
    } else {
      fetchObject.body = objectToFormData(body)
      headers = fetchObject.body.getHeaders()
    }
    return this.fetch(fetchObject.url, fetchObject, headers)
      .then(this.resolveRelatedModels.bind(this))
      .then(this.replaceCustomTypesWithValue.bind(this))
      .then(this.mapFields.bind(this))
  }

  public async update<T> (
    id: number,
    body: T extends FormData ? FormData : T & ClassSchema
  ): Promise<T & ClassObject & ClassSchema>
  public async update<T> (body: ClassSchema & T): Promise<Array<ClassObject & ClassSchema & T>>
  // tslint:disable-next-line:unified-signatures
  public async update<T> (body: Array<[number, ClassSchema & T]>): Promise<Array<ClassObject & ClassSchema & T>>
  /**
   * Update object in database
   *
   * @example
   * data.posts.update(10, {title: 'Dolor sit amet'})
   * data.posts.where('id', '<=', 10).update({title: 'Dolor sit amet'})
   * data.posts.update([
   *   [10, {title: 'Dolor sit amet'}],
   *   [15, {title: 'Lorem ipsum'}]
   * ])
   */
  public async update (id: any, body?: any): Promise<any> {
    let headers
    const isQueryUpdate =
      typeof id === 'object' && id !== null && !Array.isArray(id)

    if (isQueryUpdate) {
      const items = await this.list()
      const ids = items.map((item: any) => [item.id, id])

      return this.batch(ids)
        .then(this.resolveRelatedModels.bind(this))
        .then(this.replaceCustomTypesWithValue.bind(this))
        .then(this.mapFields.bind(this))
    }

    const fetchObject: {
      method: string
      url: string
      body?: any
    } = {
      method: 'PATCH',
      url: this.url(id as number)
    }

    const formBody = body as unknown as FormData
    const isFormData = (formBody) && formBody.constructor && formBody.constructor.name === 'FormData'

    if (isFormData) {
      fetchObject.body = formBody
      headers = formBody.getHeaders()
    } else if (Array.isArray(id)) {
      return this.batch(id, headers)
        .then(this.resolveRelatedModels.bind(this))
        .then(this.replaceCustomTypesWithValue.bind(this))
        .then(this.mapFields.bind(this))
    } else {
      fetchObject.body = objectToFormData(body)
      headers = fetchObject.body.getHeaders()
    }

    debug('simple update')
    return this.fetch(fetchObject.url, fetchObject, headers)
      .then(this.resolveRelatedModels.bind(this))
      .then(this.replaceCustomTypesWithValue.bind(this))
      .then(this.mapFields.bind(this)
    )
  }

  /**
   * Remove object from database
   *
   * @param id Single ID or array of IDs to delete from database. Leave empty to remove all objects matching query!
   * @example
   * data.posts.delete() // Remove all posts
   * data.posts.where('status', 'draft').delete() // Remove all posts matching query
   * data.posts.delete(1) // Remove post with id equal 1
   * data.posts.delete([1, 2]) // Remove post with ids in given array
   */
  public async delete (id?: number | number[]): Promise<any> {
    const isQueryDelete = id === undefined

    if (isQueryDelete) {
      const items = await this.list()
      const ids = items.map((item: ClassObject) => item.id)

      return this.batch(ids)
    }

    if (Array.isArray(id)) {
      return this.batch(id)
    }

    return this.fetch(this.url(id), {method: 'DELETE'})
  }

  protected get() {
    return this
  }

  protected url (id?: number, apiVersion?: string): string {
    const {instanceName, className} = this.instance
    let url = `${this.getInstanceURL(
      instanceName, apiVersion
    )}/classes/${className}/objects/${id ? id + '/' : ''}`

    if (this._url !== undefined) {
      url = this._url
    }

    const query = querystring.stringify(this.query)
    return query ? `${url}?${query}` : url
  }

  private batchBodyBuilder (body: any[]) {
    const {apiVersion} = this.instance
    const path = `/${apiVersion}${this.url()
      .split(apiVersion)[1]
      .split('?')[0]}`

    return body.reduce(
      (data, item) => {
        const singleRequest: {
          method: string
          path: string
          body?: object | any[] | string
        } = {
          method: 'POST',
          path
        }

        if (Array.isArray(item)) {
          singleRequest.method = 'PATCH'
          singleRequest.path = `${path}${item[0]}/`
          singleRequest.body = JSON.stringify(item[1])
        } else if (isNaN(item) === false) {
          singleRequest.method = 'DELETE'
          singleRequest.path = `${path}${item}/`
        } else {
          singleRequest.body = JSON.stringify(item)
        }

        data.requests.push(singleRequest)

        return data
      },
      {requests: []}
    )
  }

  private batchFetchObject (body: any[]) {
    const {instanceName} = this.instance

    return {
      body: JSON.stringify(this.batchBodyBuilder(body)),
      method: 'POST',
      url: `${this.getInstanceURL(instanceName)}/batch/`
    }
  }

  // TODO: Add better types
  private replaceCustomTypesWithValue<T> (items: any): any  {
    if (Array.isArray(items)) {
      return items.map((item) =>
        Object.keys(item).reduce((all, key) => ({
          ...all,
          [key]: this.replaceCustomType(key, item)
        }), {})
      )
    }

    return Object.keys(items).reduce((all, key) => ({
      ...all,
      [key]: this.replaceCustomType(key, items)
    }), {})
  }

  private replaceCustomType (key: string, item: object) {
    const value = item[key]
    const isObject = value instanceof Object && !Array.isArray(value)
    const hasType = isObject && value.type !== undefined
    const hasTarget = isObject && value.target !== undefined
    const hasValue = isObject && value.value !== undefined

    if (isObject && (hasType || hasTarget) && hasValue) {
      return value.value
    }

    return value
  }

  private mapFields (items: any[] | {}): any {
    const fields = this.mappedFields

    if (fields.length === 0) {
      return items
    }

    if (Array.isArray(items)) {
      return items.map((item) => this.mapFieldsForSingleItem(item, fields))
    }

    return this.mapFieldsForSingleItem(items, fields)
  }

  private mapFieldsForSingleItem (item: object, fields: object) {
    return Object.keys(fields).reduce(
      (all, key) => {
        const itemFieldKey = key.split('.').shift() || ''
        const itemField = get(item, itemFieldKey)

        if (Array.isArray(itemField) && typeof itemField[0] === 'object' && itemField[0] !== null) {
          itemField.forEach((arrItem, i) => {
            const path = `${itemFieldKey}.[${i}].${key.split('.').slice(1)}`
            const mappedPath = `${itemFieldKey}.[${i}].${(fields[key] || key).split('.').slice(1)}`

            set(all, mappedPath, get(item, path))
          })
        } else {
          set(all, fields[key] || key, get(item, key))
        }

        return all
      },
      {}
    )
  }

  private getRelatedObjects (reference: any, items: any[]) {
    if (!reference) {
      return null
    }

    if (Array.isArray(reference.value)) {
      return items.filter((obj) => reference.value.indexOf(obj.id) >= 0)
    }

    return items.find((obj) => obj.id === reference.value)
  }

  private async batch (body: any, headers?: object): Promise<any> {
    const type = Array.isArray(body[0])
      ? 'PATCH'
      : isNaN(body[0]) === false ? 'DELETE' : 'POST'
    const requests = chunkArray(body, MAX_BATCH_SIZE).map((chunk: any) => () => {
      const fetchObject = this.batchFetchObject(chunk)

      return this.fetch(fetchObject.url, fetchObject, headers)
    })

    return new Promise((resolve, reject) => {
      let resolves: any[] = []
      let i = 0

      async function next() {
        const request = requests[i++]

        try {
          if (request) {
            const data = await request()
            const items = data.map(
              (item: any) => (item.content ? item.content : item)
            )
            resolves = resolves.concat(items)
            next()
          } else {
            resolve(type === 'DELETE' ? body : resolves)
          }
        } catch (err) {
          reject(err)
        }
      }

      next()
    })
  }

  private normalizeWhereOperator<A> (operator?: any): string {
    const operators = {
      '!=': 'neq',
      '<': 'lt',
      '<=': 'lte',
      '<>': 'neq',
      '=': 'eq',
      '>': 'gt',
      '>=': 'gte'
    }

    return operators[operator] || operator
  }

  private toWhereArray<T> (attributes: T) {
    return Object.keys(attributes).map((key) => [key, 'eq', attributes[key]]) as Array<[
      Fields<T, ClassSchema>, 'eq', string | number | boolean | null
    ]>
  }

  private async resolveRelatedModels (result: any) {
    debug('resolveRelatedModels')
    let resultsToProcess = result
    if (!Array.isArray(result)) {
      resultsToProcess = [result]
    }

    if (this.relationships.length === 0) {
      return result
    }

    const resolvers = this.relationships.map(async (reference) => {
      const empty = {
        items: [],
        target: reference
      }

      if (resultsToProcess[0] === undefined) {
        return empty
      }

      if (resultsToProcess[0][reference] === undefined) {
        throw new Error(`Invalid reference name "${reference}"`)
      }

      // Search for rows with references
      const references = resultsToProcess
        .filter((row: object) => row[reference])
        .map((row: object) => {
          return row[reference]
        })

      // No references so resolve with empty array
      if (references.length === 0) {
        return empty
      }

      const {target} = references[0]

      if (target === undefined) {
        throw new Error(`Column "${reference}" has no target`)
      }

      let ids = references.map((item: any) => item.value)
      ids = Array.isArray(ids[0]) ? [].concat.apply([], ids) : ids

      const chunks = chunkArray(ids, MAX_COLUMN_IN_VALUES_LOOKUP)
      debug('resolveRelatedModels/chunks %o', chunks)
      const items: ClassObject[] = await Promise
        .all(chunks.map((arr) => {
          const load = new DataClass(this.instance)

          if (target === 'user') {
            load._url = `${this.getInstanceURL(
              this.instance.instanceName, 'v3'
            )}/users/`
          }

          load.instance = this.instance
          load.instance.className = target

          return load.where('id', 'in', arr).list()
        }))
        .then((arr) => [].concat.apply([], arr as any))

      debug('resolveRelatedModels items %o', items)

      return {target: reference, items}
    })

    const models = await Promise.all(resolvers)
    const processedResult = resultsToProcess.map((item: any) => {
      models.forEach(({target, items}) => {
        const related = this.getRelatedObjects(item[target], items)
        item[target] = related || item[target]
      })
      return item
    })

    if (!Array.isArray(result)) {
      return processedResult[0]
    }
    return processedResult
  }

  private resolveIfFinished (result: any[]) {
    if (this.query.limit) {
      return result.slice(0, this.query.limit)
    }
    return result
  }

  private async loadNextPage (response: any, objects: any[]) {
    const hasNextPageMeta = response.next
    const hasNotEnoughResults = !this.query.limit || this.query.limit > objects.length

    if (hasNextPageMeta && hasNotEnoughResults) {
      const next = response.next.replace(/\?.*/, '')
      const nextParams = querystring.parse(
        response.next.replace(/.*\?/, '')
      )
      const q = querystring.stringify({...this.query, ...nextParams})
      debug('loadNextPage %o', {q, next})
      const nextObjects = await this.request(`${this.baseUrl}${next}?${q}`)
      return objects.concat(nextObjects)
    }

    return objects
  }

  private async request (url: string) {
    debug('request')
    try {
      const result = await this.fetch(url)
      let objects = result.objects
      objects = await this.loadNextPage(result, objects)
      objects = await this.resolveIfFinished(objects)
      return objects
    } catch (err) {
      err.message = get(err, 'response.data.query')
      throw err
    }
  }
}
