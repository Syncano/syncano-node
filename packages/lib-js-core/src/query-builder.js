import http from 'https'
import logger from 'debug'
import pjson from '../package.json'
import nodeFetch from 'node-fetch'
import {checkStatus, parseJSON} from './utils'

const debug = logger('core:query-builder')

const generalOptions = {
  compress: true,
  agent: new http.Agent({
    protocol: 'https',
    keepAlive: true,
    keepAliveMsecs: 5000,
    maxSockets: 60
  })
}

export default class QueryBuilder {
  constructor (instance) {
    this.instance = instance
    this.baseUrl = `https://${instance.host}`
    this.result = []
  }

  _getSyncanoURL (apiVersion) {
    let apiVersionInURL = apiVersion
    if (!apiVersionInURL) {
      apiVersionInURL = this.instance.apiVersion
    }

    return `https://${this.instance.host}/${apiVersionInURL}`
  }

  _getSyncanoRegistryURL () {
    const {host} = this.instance
    const endpointHost = host === 'api.syncano.io' ? 'syncano.space' : 'syncano.link'
    const majorVersion = pjson.version.split('.')[0]
    const registryInstance = process.env.SYNCANO_SOCKET_REGISTRY_INSTANCE || `registry-${majorVersion}`
    this.registryHost = `${registryInstance}.${endpointHost}`
    debug('registryHost', this.registryHost)
    return `https://${this.registryHost}`
  }

  _getInstanceURL (instanceName, apiVersion) {
    return `${this._getSyncanoURL(apiVersion)}/instances/${instanceName}`
  }

  fetch (url, options = {}, headers = {}) {
    const headersToSend = Object.assign(
      {
        'content-type': 'application/json',
        'x-api-key': this.instance.token
      },
      headers,
      options.headers
    )
    delete options.headers

    const fetchOptions = Object.assign({}, generalOptions, options)
    return nodeFetch(url, {
      headers: headersToSend,
      ...fetchOptions
    })
      .then(parseJSON)
      .then(checkStatus)
  }

  nonInstanceFetch (url, options = {}, headers) {
    const fetchOptions = Object.assign({}, generalOptions, options)
    return nodeFetch(url, {
      headers: {
        'content-type': 'application/json',
        ...headers
      },
      ...fetchOptions
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
