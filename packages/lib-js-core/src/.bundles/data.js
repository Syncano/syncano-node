'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})

var _querystring = require('querystring')

var _querystring2 = _interopRequireDefault(_querystring)

var _formData = require('form-data')

var _formData2 = _interopRequireDefault(_formData)

var _lodash = require('lodash.set')

var _lodash2 = _interopRequireDefault(_lodash)

var _lodash3 = require('lodash.get')

var _lodash4 = _interopRequireDefault(_lodash3)

var _lodash5 = require('lodash.merge')

var _lodash6 = _interopRequireDefault(_lodash5)

var _queryBuilder = require('./query-builder')

var _queryBuilder2 = _interopRequireDefault(_queryBuilder)

var _errors = require('./errors')

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj}
}

/**
 * Syncano server
 * @property {Function} query Instance of syncano DataObject
 */
class Data extends _queryBuilder2.default {
  url(id) {
    const {instanceName, className} = this.instance
    let url = `${this._getInstanceURL(
      instanceName
    )}/classes/${className}/objects/${id ? id + '/' : ''}`

    if (this._url !== undefined) {
      url = this._url
    }

    const query = _querystring2.default.stringify(this.query)

    return query ? `${url}?${query}` : url
  }

  _batchBodyBuilder(body) {
    const {instanceName, className, apiVersion} = this.instance
    const path = `/${apiVersion}/instances/${instanceName}/classes/${className}/objects/`

    return body.reduce(
      (data, item) => {
        const singleRequest = {
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

  _batchFetchObject(body) {
    const {instanceName} = this.instance

    return {
      url: `${this._getInstanceURL(instanceName)}/batch/`,
      method: 'POST',
      body: JSON.stringify(this._batchBodyBuilder(body))
    }
  }

  /**
   * List objects matching query.
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * // Get all posts
   * const posts = await data.posts.list()
   * @example {@lang javascript}
   * // Get 10 posts
   * const posts = await data.posts.take(10).list()
   */
  list() {
    let result = []
    const self = this
    const {baseUrl, relationships, instance, mappedFields, _mapFields} = this
    const fetch = this.fetch.bind(this)
    const pageSize = this.query.page_size || 0

    return new Promise((resolve, reject) => {
      request(this.url())

      function request(url) {
        fetch(url)
          .then(saveToResult)
          .then(loadNextPage)
          .then(resolveRelatedModels)
          .then(replaceCustomTypesWithValue)
          .then(mapResultFields)
          .then(resolveIfFinished)
          .catch(err => reject(err))
      }

      function saveToResult(response) {
        result = result.concat(response.objects)

        return response
      }

      function loadNextPage(response) {
        const hasNextPageMeta = response.next
        const hasNotEnoughResults = pageSize === 0 || pageSize > result.length

        if (hasNextPageMeta && hasNotEnoughResults) {
          request(`${baseUrl}${response.next}`)
        } else {
          return true
        }
      }

      function resolveRelatedModels(shouldResolve) {
        if (shouldResolve === false) {
          return
        }

        return new Promise((resolve, reject) => {
          if (relationships.length === 0) {
            resolve(true)
          }

          const resolvers = relationships.map(reference => {
            return new Promise((resolve, reject) => {
              const empty = {
                target: reference,
                items: []
              }

              if (result[0] === undefined) {
                resolve(empty)
              }

              if (result[0][reference] === undefined) {
                throw new Error(`Invalid reference name "${reference}"`)
              }

              // Search for rows with references
              const references = result.filter(row => row[reference]).map(
                row => {
                  return row[reference]
                }

                // No references so resolve with empty array
              )
              if (references.length === 0) {
                resolve(empty)
              }

              const {target} = references[0]
              const load = new Data(self.instance)
              let ids = references.map(item => item.value)

              ids = Array.isArray(ids[0]) ? ids[0] : ids

              if (target === 'user') {
                load._url = `${self._getInstanceURL(
                  instance.instanceName
                )}/users/`
              }

              load.instance = self.instance
              load.instance.className = target

              load
                .where('id', 'in', ids)
                .list()
                .then(items => {
                  resolve({target: reference, items})
                })
                .catch(reject)
            })
          })

          Promise.all(resolvers)
            .then(models => {
              result = result.map(item => {
                models.forEach(({target, items}) => {
                  const related = self._getRelatedObjects(item[target], items)

                  item[target] = related || item[target]
                })

                return item
              })

              resolve(true)
            })
            .catch(reject)
        })
      }

      function replaceCustomTypesWithValue(shouldResolve) {
        if (shouldResolve === false) {
          return
        }

        result = result.map(item => {
          Object.keys(item).forEach(key => {
            const value = item[key]
            const isObject = value instanceof Object && !Array.isArray(value)
            const hasType = isObject && value.type !== undefined
            const hasTarget = isObject && value.target !== undefined
            const hasValue = isObject && value.value !== undefined

            if (isObject && hasType && hasTarget && hasValue) {
              item[key] = value.value
            }
          })

          return item
        })

        return true
      }

      function mapResultFields(shouldResolve) {
        if (shouldResolve === false) {
          return
        }

        result = _mapFields(result, mappedFields)

        return true
      }

      function resolveIfFinished(shouldResolve) {
        if (shouldResolve) {
          if (pageSize !== 0) {
            result = result.slice(0, pageSize)
          }

          resolve(result)
        }
      }
    })
  }

  _mapFields(items, fields) {
    return fields.length === 0
      ? items
      : items.map(item =>
          Object.keys(fields).reduce(
            (all, key) =>
              (0, _lodash2.default)(
                all,
                fields[key] || key,
                (0, _lodash4.default)(item, key)
              ),
            {}
          )
        )
  }

  _getRelatedObjects(reference, items) {
    if (!reference) {
      return null
    }

    if (Array.isArray(reference.value)) {
      return items.filter(obj => reference.value.indexOf(obj.id) >= 0)
    }

    return items.find(obj => obj.id === reference.value)
  }

  /**
   * Get first element matching query or return null.
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * const posts = await data.posts.where('status', 'published').first()
   */
  first() {
    return this.take(1)
      .list()
      .then(response => response[0] || null)
  }

  /**
   * Get first element matching query or throw error
   *
   * @example {@lang javascript}
   * const posts = await data.posts.where('status', 'published').firstOrFail()
   */
  firstOrFail() {
    return new Promise((resolve, reject) => {
      this.first()
        .then(
          object =>
            object ? resolve(object) : reject(new _errors.NotFoundError())
        )
        .catch(() => {
          reject(new _errors.NotFoundError())
        })
    })
  }

  /**
   * Get the first record matching the attributes or create it.
   *
   * @example {@lang javascript}
   * const post = await data.posts
   *   .updateOrCreate({name: 'value to match'}, {content: 'value to update'})
   */
  firstOrCreate(attributes, values = {}) {
    const query = this._toWhereArray(attributes)

    return this.where(query)
      .firstOrFail()
      .catch(() => this.create((0, _lodash6.default)(attributes, values)))
  }

  /**
   * Create or update a record matching the attributes, and fill it with values.
   *
   * @example {@lang javascript}
   * const post = await data.posts
   *   .updateOrCreate({name: 'value to match'}, {content: 'value to update'})
   */
  updateOrCreate(attributes, values = {}) {
    const query = this._toWhereArray(attributes)

    return this.where(query)
      .firstOrFail()
      .then(res => this.update(res.id, values))
      .catch(() => this.create((0, _lodash6.default)(attributes, values)))
  }

  _toWhereArray(attributes) {
    return Object.keys(attributes).map(key => [key, 'eq', attributes[key]])
  }

  /**
   * Get single object by id or objects list if ids passed as array.
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * const posts = await data.posts.find(4)
   * @example {@lang javascript}
   * const posts = await data.posts.find([20, 99, 125])
   */
  find(ids) {
    if (Array.isArray(ids)) {
      return this.where('id', 'in', ids).list()
    }

    return this.where('id', 'eq', ids).first()
  }

  /**
   * Same as #find method but throws error for no results.
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * const posts = await data.posts.findOrFail(4)
   * @example {@lang javascript}
   * const posts = await data.posts.findOrFail([20, 99, 125])
   * @example {@lang javascript}
   * // Will throw error if at lest one of records was not found
   * const posts = await data.posts.findOrFail([20, 99, 125], true)
   */
  findOrFail(ids) {
    return new Promise((resolve, reject) => {
      this.find(ids)
        .then(response => {
          const shouldThrow = Array.isArray(ids)
            ? response.length !== ids.length
            : response === null

          return shouldThrow
            ? reject(new _errors.NotFoundError())
            : resolve(response)
        })
        .catch(() => {
          reject(new _errors.NotFoundError())
        })
    })
  }

  /**
   * Number of objects to get.
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * const posts = await data.posts.take(500).list()
   */
  take(count) {
    return this.withQuery(
      {page_size: count} // eslint-disable-line camelcase
    )
  }

  /**
   * Set order of fetched objects.
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * const posts = await data.posts.orderBy('created_at', 'DESC').list()
   */
  orderBy(column, direction = 'asc') {
    direction = direction.toLowerCase()
    direction = direction === 'desc' ? '-' : ''

    return this.withQuery({
      order_by: `${direction}${column}` // eslint-disable-line camelcase
    })
  }

  /**
   * Filter rows.
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * const posts = await data.posts.where('status', 'in', ['draft', 'published']).list()
   * @example {@lang javascript}
   * const posts = await data.posts.where('status', 'published').list()
   * @example {@lang javascript}
   * const posts = await data.posts.where('created_at', 'gt' '2016-02-13').list()
   * @example {@lang javascript}
   * const posts = await data.posts.where('user.id', 30).list()
   * @example {@lang javascript}
   * const posts = await data.posts.where('user.full_name', 'contains', 'John').list()
   */
  where(column, operator, value) {
    if (Array.isArray(column)) {
      column.map(([itemColumn, itemOperator, itemValue]) =>
        this.where(itemColumn, itemOperator, itemValue)
      )

      return this
    }
    operator = this._normalizeWhereOperator(operator)

    const whereOperator = value ? `_${operator}` : '_eq'
    const whereValue = value === undefined ? operator : value

    const currentQuery = JSON.parse(this.query.query || '{}')

    const nextQuery = column
      .split('.')
      .reverse()
      .reduce(
        (child, item) => ({
          [item]:
            child === null
              ? {
                  [whereOperator]: whereValue
                }
              : {
                  _is: child
                }
        }),
        null
      )

    const query = (0, _lodash6.default)({}, currentQuery, nextQuery)

    return this.withQuery({query: JSON.stringify(query)})
  }

  _normalizeWhereOperator(operator) {
    const operators = {
      '<': 'lt',
      '<=': 'lte',
      '>': 'gt',
      '>=': 'gte',
      '=': 'eq',
      '!=': 'neq',
      '<>': 'neq'
    }

    return operators[operator] || operator
  }

  /**
   * Whitelist returned keys.
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * const posts = await data.users.fields('name', 'email as username')->list()
   */
  fields(...fields) {
    if (Array.isArray(fields[0])) {
      fields = fields[0]
    }

    const fieldsToMap = fields.map(field => {
      const [, from, , to] = field.match(/([\w_\-.]*)(\sas\s)?(.*)?/)

      return {[from]: to}
    })

    this.withMappedFields(fieldsToMap)

    return this
  }

  /**
   * Expand references and relationships.
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * data.posts.with('author').list()
   * @example {@lang javascript}
   * data.posts.with(['author', 'last_editor']).list()
   */
  with(...models) {
    const relationships = Array.isArray(models[0]) ? models[0] : models

    return this.withRelationships(relationships)
  }

  /**
   * Get values of single column.
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * data.posts.where('id', 10).pluck('title')
   */
  pluck(column) {
    return this.list().then(items => items.map(item => item[column]))
  }

  /**
   * Get value of single record column field.
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * data.posts.where('id', 10).value('title')
   */
  value(column) {
    return this.first().then(item => item[column])
  }

  /**
   * Create new object.
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * const posts = await data.posts.create({
   *   title: 'Example post title',
   *   content: 'Lorem ipsum dolor sit amet.'
   * })
   * data.posts.create([
   *  { content: 'Lorem ipsum!' },
   *  { content: 'More lorem ipsum!' }
   * ])
   */
  create(body) {
    let headers = null
    let fetchObject = {
      url: this.url(),
      method: 'POST',
      body: JSON.stringify(body)
    }

    if (body instanceof _formData2.default) {
      fetchObject.body = body
      headers = body.getHeaders()
    } else if (Array.isArray(body)) {
      fetchObject = this._batchFetchObject(body)
    }

    return this.fetch(fetchObject.url, fetchObject, headers)
  }

  /**
   * Update object in database.
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * data.posts.update(55, { content: 'No more lorem ipsum!' })
   * data.posts.update([
   *  [55, { content: 'No more lorem ipsum!' }],
   *  [56, { content: 'No more lorem ipsum!' }]
   * ])
   * data.posts.update({title: 'Update all posts title'})
   * data.flights
   *   .where('active', 1)
   *   .where('destination', 'Warsaw')
   *   .update({delayed: 1})
   */
  update(id, body) {
    const isQueryUpdate =
      typeof id === 'object' && id !== null && !Array.isArray(id)
    let fetchObject = {
      url: this.url(id),
      method: 'PATCH',
      body: JSON.stringify(body)
    }

    if (isQueryUpdate) {
      return this.list().then(items => {
        const ids = items.map(item => [item.id, id])

        fetchObject = this._batchFetchObject(ids)

        return this.fetch(fetchObject.url, fetchObject)
      })
    }

    if (Array.isArray(id)) {
      fetchObject = this._batchFetchObject(id)
    }

    return this.fetch(fetchObject.url, fetchObject)
  }

  /**
   * Remove object from database.
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * data.posts.delete(55)
   * data.posts.delete([55, 56, 57])
   * data.posts.delete()
   * data.posts.where('draft', 1).delete()
   */
  delete(id) {
    const isQueryDelete = id === undefined
    let fetchObject = {
      url: this.url(id),
      method: 'DELETE'
    }

    if (isQueryDelete) {
      return this.list().then(items => {
        const ids = items.map(item => item.id)

        fetchObject = this._batchFetchObject(ids)

        return this.fetch(fetchObject.url, fetchObject)
      })
    }

    if (Array.isArray(id)) {
      fetchObject = this._batchFetchObject(id)
    }

    return this.fetch(fetchObject.url, fetchObject)
  }
}

exports.default = Data
