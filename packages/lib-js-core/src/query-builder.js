import logger from 'debug'
import nodeFetch from 'node-fetch'
import {checkStatus, parseJSON} from './utils'

const debug = logger('core:query-builder')

export default class QueryBuilder {
  constructor (instance) {
    this.instance = instance
    this.baseUrl = `https://${instance.host}`
    this.result = []
  }

  _getSyncanoURL () {
    const {apiVersion, host} = this.instance

    return `https://${host}/${apiVersion}`
  }

  _getInstanceURL (instanceName) {
    return `${this._getSyncanoURL()}/instances/${instanceName}`
  }

  fetch (url, options, headers = {}) {
    const headersToSend = Object.assign(
      {
        'content-type': 'application/json',
        'x-api-key': this.instance.token
      },
      headers
    )

    return nodeFetch(url, {
      headers: headersToSend,
      ...options
    })
      .then(parseJSON)
      .then(checkStatus)
  }

  nonInstanceFetch (url, options, headers) {
    return nodeFetch(url, {
      headers: {
        'content-type': 'application/json',
        ...headers
      },
      ...options
    })
      .then(parseJSON)
      .then(checkStatus)
  }

  get query () {
    return this._query || {}
  }

  get queries () {
    return this._queries || []
  }

  get relationships () {
    return this._relationships || []
  }

  get mappedFields () {
    return this._mappedFields || []
  }

  withQuery (query) {
    debug('withQuery', query)
    this._query = Object.assign({}, this.query, query)

    return this
  }

  withRelationships (relationships) {
    this._relationships = this.relationships.concat(relationships)

    return this
  }

  withMappedFields (fields) {
    this._mappedFields = Object.assign({}, this.mappedFields, ...fields)

    return this
  }
}
