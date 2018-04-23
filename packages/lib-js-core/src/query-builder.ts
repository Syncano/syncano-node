import * as logger from 'debug'
import {Agent} from 'https'
import nodeFetch from 'node-fetch'
import {checkStatus, parseJSON} from './utils'
const pjson = require('../package.json')

const debug = logger('core:query-builder')

const generalOptions = {
  agent: new Agent({
    keepAlive: true,
    keepAliveMsecs: 5000,
    maxSockets: 60
  }),
  compress: true
}

export default class QueryBuilder {
  // tslint:disable-next-line:variable-name
  protected _mappedFields: any[] = []
  // tslint:disable-next-line:variable-name
  protected _relationships: any[] = []
  // tslint:disable-next-line:variable-name
  protected _queries: any[] = []
  // tslint:disable-next-line:variable-name
  protected _query: {
    [x: string]: any
  } = {}
  protected registryHost: string = ''
  protected instance: any
  protected baseUrl: string
  protected result: any[]

  // TODO: Specify instance type
  constructor (instance: any) {
    this.instance = instance
    this.baseUrl = `https://${instance.host}`
    this.result = []
  }

  protected fetch (url: string, options = {}, headers = {}): Promise<any> {
    const headersToSend = Object.assign(
      {
        'content-type': 'application/json',
        'x-api-key': this.instance.token
      },
      headers
    )
    const fetchOptions = Object.assign({}, generalOptions, options)

    return nodeFetch(url, {
      headers: headersToSend,
      ...fetchOptions
    })
      .then(parseJSON)
      .then(checkStatus)
  }

  protected nonInstanceFetch (url: string, options = {}, headers = {}) {
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

  protected get query (): {
    page_size?: number
    [x: string]: any
  } {
    return this._query || {}
  }

  protected get queries (): any[] {
    return this._queries || []
  }

  protected get relationships () {
    return this._relationships || []
  }

  protected get mappedFields () {
    return this._mappedFields || []
  }

  protected withQuery (query: object) {
    debug('withQuery', query)
    this._query = Object.assign({}, this.query, query)

    return this
  }

  protected withRelationships (relationships: any[]) {
    this._relationships = this.relationships.concat(relationships)

    return this
  }

  protected withMappedFields (fields: any[]) {
    this._mappedFields = Object.assign({}, this.mappedFields, ...fields)

    return this
  }

  protected getSyncanoURL () {
    const {apiVersion, host} = this.instance

    return `https://${host}/${apiVersion}`
  }

  protected getSyncanoRegistryURL () {
    const {host} = this.instance
    const endpointHost = host === 'api.syncano.io' ? 'syncano.space' : 'syncano.link'
    const majorVersion = pjson.version.split('.')[0]
    const registryInstance = process.env.SYNCANO_SOCKET_REGISTRY_INSTANCE || `registry-${majorVersion}`
    this.registryHost = `${registryInstance}.${endpointHost}`
    debug('registryHost', this.registryHost)
    return `https://${this.registryHost}`
  }

  protected getInstanceURL (instanceName: string) {
    return `${this.getSyncanoURL()}/instances/${instanceName}`
  }
}
