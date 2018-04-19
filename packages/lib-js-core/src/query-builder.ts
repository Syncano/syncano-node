import logger from 'debug'
import {Agent} from 'https'
import nodeFetch from 'node-fetch'
// tslint:disable-next-line:no-var-requires
const pjson = require('../package.json')
import {checkStatus, parseJSON} from './utils'

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
  public _mappedFields: any[] = []
  // tslint:disable-next-line:variable-name
  public _relationships: any[] = []
  // tslint:disable-next-line:variable-name
  public _queries: any[] = []
  // tslint:disable-next-line:variable-name
  public _query: {
    [x: string]: any
  } = {}
  public registryHost: string = ''
  public instance: any
  public baseUrl: string
  public result: any[]

  // TODO: Specify instance type
  constructor (instance: any) {
    this.instance = instance
    this.baseUrl = `https://${instance.host}`
    this.result = []
  }

  public _getSyncanoURL () {
    const {apiVersion, host} = this.instance

    return `https://${host}/${apiVersion}`
  }

  public _getSyncanoRegistryURL () {
    const {host} = this.instance
    const endpointHost = host === 'api.syncano.io' ? 'syncano.space' : 'syncano.link'
    const majorVersion = pjson.version.split('.')[0]
    const registryInstance = process.env.SYNCANO_SOCKET_REGISTRY_INSTANCE || `registry-${majorVersion}`
    this.registryHost = `${registryInstance}.${endpointHost}`
    debug('registryHost', this.registryHost)
    return `https://${this.registryHost}`
  }

  public _getInstanceURL (instanceName: string) {
    return `${this._getSyncanoURL()}/instances/${instanceName}`
  }

  public fetch (url: string, options = {}, headers = {}): Promise<any> {
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

  public nonInstanceFetch (url: string, options = {}, headers = {}) {
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

  get query (): {
    page_size?: number
    [x: string]: any
  } {
    return this._query || {}
  }

  get queries (): any[] {
    return this._queries || []
  }

  get relationships () {
    return this._relationships || []
  }

  get mappedFields () {
    return this._mappedFields || []
  }

  public withQuery (query: object) {
    debug('withQuery', query)
    this._query = Object.assign({}, this.query, query)

    return this
  }

  public withRelationships (relationships: any[]) {
    this._relationships = this.relationships.concat(relationships)

    return this
  }

  public withMappedFields (fields: any[]) {
    this._mappedFields = Object.assign({}, this.mappedFields, ...fields)

    return this
  }
}
