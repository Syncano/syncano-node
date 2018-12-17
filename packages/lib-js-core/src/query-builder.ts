import * as logger from 'debug'
import {Agent} from 'https'
import nodeFetch, { RequestInit } from 'node-fetch'
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

  protected async fetch (url: string, options: RequestInit = {}, headers = {}): Promise<any> {
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

    const res = await nodeFetch(url, {
      headers: headersToSend,
      ...fetchOptions
    })
    const json = await parseJSON(res)

    return checkStatus(json)
  }

  protected async nonInstanceFetch (url: string, options: RequestInit = {}, headers = {}) {
    const fetchOptions = Object.assign({}, generalOptions, options)

    const res = await nodeFetch(url, {
      headers: {
        'content-type': 'application/json',
        ...headers
      },
      ...fetchOptions
    })
    const json = await parseJSON(res)

    return checkStatus(json)
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

  protected getSyncanoURL (apiVersion: string = this.instance.apiVersion) {
    const {host} = this.instance

    return `https://${host}/${apiVersion}`
  }

  protected getInstanceURL (instanceName: string, apiVersion?: string) {
    return `${this.getSyncanoURL(apiVersion)}/instances/${instanceName}`
  }
}
