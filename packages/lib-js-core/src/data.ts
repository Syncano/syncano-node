import * as logger from 'debug'
import * as FormData from 'form-data'
import * as querystring from 'querystring'
import {NotFoundError} from './errors'
import QueryBuilder from './query-builder'
import {ACL} from './types'
const get = require('lodash.get')
const merge = require('lodash.merge')
const set = require('lodash.set')
const debug = logger('core:data')

const MAX_BATCH_SIZE = 50

export interface ClassObject {
  id: number
  created_at: string
  updated_at: string
  revision: number
  acl: ACL
  channel: null
  channel_room: null
  links: {
    self: string
    [x: string]: string
  }
  [x: string]: any
}

class Data extends QueryBuilder {
  // tslint:disable-next-line:variable-name
  private _url?: string

  [x: string]: any

  // TODO: Add better return type
  /**
   * List objects matching query
   */
  public async list (): Promise<any> {
    debug('list')
    const self = this
    const urls = [this.url()].concat(this.queries.map((query) => {
      this._query.query = query
      return this.url()
    }))
    debug('urls', urls)
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
   * Get first element matching query or return null
   *
   * @example
   * data.posts.first()
   * data.posts.where('likes', '>', 100).first()
   */
  public async first (): Promise<ClassObject|null> {
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
  public async firstOrFail (): Promise<ClassObject> {
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
   * @param {Object} attributes Parameteres used to find object
   * @param values Parameters used to create object if not found
   * @example
   * data.tags.firstOrCreate({name: 'dogs'}, {firstUsedBy: 'authorID'})
   */
  public firstOrCreate<T, I> (attributes: object&T, values?: object&I): Promise<T & I & ClassObject> {
    const query = this.toWhereArray(attributes)

    return this.where(query)
      .firstOrFail()
      .catch(() => this.create(merge(attributes, values || {})))
  }

  /**
   * Create or update a record matching the attributes, and fill it with values
   */
  public async updateOrCreate (attributes: object, values = {}) {
    const query = this.toWhereArray(attributes)

    try {
      const res = await this.where(query).firstOrFail()
      return this.update(res.id, values)
    } catch (err) {
      return this.create(merge(attributes, values))
    }
  }

  // TODO: Add return type
  /**
   * Get single object by ID
   *
   * @param ids Single object ID
   * @example
   * data.posts.find(1)
   */
  public async find (id: number|number[]) {
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
  public async findMany (ids: number[]): Promise<ClassObject[]> {
    debug('findMany', ids)

    if (Array.from(ids).length === 0) {
      return []
    }

    return this.where('id', 'in', ids).list()
  }

  /**
   * Same as `find` method but throws error for no results
   *
   * @param ids Single object ID or array of IDs
   * @throws {NotFoundError} No results for given query
   * @example
   * data.posts.findOrFail(1) // returns single object
   * data.posts.findOrFail([1, 2]) // returns array of objects
   */
  public async findOrFail<T> (ids: T&number|T&number[]): Promise<ClassObject> {
    try {
      const response  = await this.find(ids)
      const shouldThrow = Array.isArray(response) && Array.isArray(ids)
        ? response.length !== ids.length
        : response === null

      if (shouldThrow) {
        throw new NotFoundError()
      }

      return response as ClassObject
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
    return this.withQuery({page_size: count})
  }

  /**
   * Set order of fetched objects
   *
   * @param {string} column Name of class column
   * @param {string} direction Direction of order. Can be `ASC`(default) or `DESC`
   */
  public orderBy (column: string, direction: 'ASC' | 'DESC' = 'ASC') {
    const dir = direction.toUpperCase()
    const sign = dir === 'DESC' ? '-' : ''

    return this.withQuery({
      order_by: `${sign}${column}`
    })
  }

  /**
   * Filter objects
   *
   * @see https://cheatsheet.syncano.io/#server
   * @example
   * data.posts.where('id', 'in', [10, 20]).list()
   * data.posts.where('id', 10).list()
   * data.posts.where('id', '>=', 10).list()
   */
  public where (column: string | any[], operator?: any, value?: any) {
    debug('where', column, operator, value)
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

    const nextQuery = column
      .split('.')
      .reverse()
      .reduce((child, item) => ({
        [item]: Object.keys(child).length === 0
          ? {[whereOperator]: whereValue}
          : {_is: child}
      }), {})
    const query = merge({}, currentQuery, nextQuery)

    return this.withQuery({query: JSON.stringify(query)})
  }

  // TODO: Add better argument types
  /**
   * Execute "or where" query
   *
   * @example
   * data.posts
   *   .where('likes', '<=', 100)
   *   .orWhere('likes', '>=', 200).list()
   */
  public orWhere (column: string | any[], operator?: any, value?: any) {
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
  public whereNotNull (column: string) {
    return this.where(column, 'exists', true)
  }

  /**
   * Get objects where column value is a part of given array or string
   *
   * @example
   * data.posts.whereIn('id', [100, 200]).list()
   */
  public whereIn (column: string, arr: string[] | number[]) {
    return this.where(column, 'in', arr)
  }

  /**
   * Get objects where column value is not a part of given array or string
   *
   * @example
   * data.posts.whereNotIn('id', [10, 20]).list()
   */
  public whereNotIn (column: string, arr: string[] | number[]) {
    return this.where(column, 'nin', arr)
  }

  /**
   * Get objects where column value is null
   *
   * @example
   * data.posts.whereNull('title').list()
   */
  public whereNull (column: string) {
    return this.where(column, null)
  }

  /**
   * Get objects where column value is between given min and max
   *
   * @example
   * data.posts.whereBetween('likes', 100, 200).list()
   */
  public whereBetween (column: string, min: number, max: number) {
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
  public async pluck (column: string): Promise<any[]> {
    const items = await this.list()
    return items.map((item: any) => item[column])
  }

  /**
   * Get value of single record column field
   *
   * @example
   * data.posts.where('id', 1).value('created_at') // returns first created_at value
   */
  public async value (column: string): Promise<any> {
    const item = await this.firstOrFail()
    return item[column]
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
  public create<T> (body: T): Promise<T extends any[] ? Array<ClassObject & T[0]> : ClassObject & T> {
    let headers
    const fetchObject: {
      method: string
      url: string
      body?: any
    } = {
      method: 'POST',
      url: this.url()
    }

    if (body instanceof FormData) {
      fetchObject.body = body
      headers = body.getHeaders()
    } else if (Array.isArray(body)) {
      return this.batch(body)
        .then(this.replaceCustomTypesWithValue.bind(this))
        .then(this.mapFields.bind(this))
    } else {
      fetchObject.body = JSON.stringify(body)
    }

    return this.fetch(fetchObject.url, fetchObject, headers)
      .then(this.resolveRelatedModels.bind(this))
      .then(this.replaceCustomTypesWithValue.bind(this))
      .then(this.mapFields.bind(this))
  }

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
  public update (id: number | object, body?: object): Promise<any> {
    let headers
    const isQueryUpdate =
      typeof id === 'object' && id !== null && !Array.isArray(id)

    if (isQueryUpdate) {
      return this.list().then((items) => {
        const ids = items.map((item: any) => [item.id, id])

        return this.batch(ids)
          .then(this.resolveRelatedModels.bind(this))
          .then(this.replaceCustomTypesWithValue.bind(this))
          .then(this.mapFields.bind(this))
      })
    }

    const fetchObject: {
      method: string
      url: string
      body?: any
    } = {
      method: 'PATCH',
      url: this.url(id as number)
    }

    if (body instanceof FormData) {
      fetchObject.body = body
      headers = body.getHeaders()
    } else if (Array.isArray(id)) {
      return this.batch(id, headers)
        .then(this.resolveRelatedModels.bind(this))
        .then(this.replaceCustomTypesWithValue.bind(this))
        .then(this.mapFields.bind(this))
    } else {
      fetchObject.body = JSON.stringify(body)
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

  protected url (id?: number): string {
    debug('url', id)
    const {instanceName, className} = this.instance
    let url = `${this.getInstanceURL(
      instanceName
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

  private chunk (items: any[], size: number): any[] {
    return items
      .map((e, i) => (i % size === 0 ? items.slice(i, i + size) : null))
      .filter(Boolean)
  }

  private async batch (body: any, headers?: object): Promise<any> {
    const type = Array.isArray(body[0])
      ? 'PATCH'
      : isNaN(body[0]) === false ? 'DELETE' : 'POST'
    const requests = this.chunk(body, MAX_BATCH_SIZE).map((chunk: any) => () => {
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
    return Object.keys(attributes).map((key) => [key, 'eq', attributes[key]])
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

      const load = new Data(this.instance)
      let ids = references.map((item: any) => item.value)

      ids = Array.isArray(ids[0]) ? [].concat.apply([], ids) : ids

      if (target === 'user') {
        load._url = `${this.getInstanceURL(
          this.instance.instanceName
        )}/users/`
      }

      load.instance = this.instance
      load.instance.className = target

      const items = await load.where('id', 'in', ids).list()
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
    if (this.query.page_size !== 0) {
      return result.slice(0, this.query.page_size)
    }
    return result
  }

  private async loadNextPage (response: any, objects: any[]) {
    debug('loadNextPage')
    const pageSize = this.query.page_size || 0
    const hasNextPageMeta = response.next
    const hasNotEnoughResults = pageSize === 0 || pageSize > objects.length

    if (hasNextPageMeta && hasNotEnoughResults) {
      const next = response.next.replace(/\?.*/, '')
      const nextParams = querystring.parse(
        response.next.replace(/.*\?/, '')
      )
      const q = querystring.stringify({...this.query, ...nextParams})
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

export default Data
