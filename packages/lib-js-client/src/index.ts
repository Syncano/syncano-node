import * as axios from 'axios'

const buildURL = require('axios/lib/helpers/buildURL')
const {default: request} = axios

export interface SyncanoClientOptions {
  host?: string
  token?: string
  apiVersion?: string
  transformResponse?: (response: axios.AxiosResponse) => void
}

export default class SyncanoClient {
  /**
   *  User api key used to authenticate requests
   *
   * @type {string}
   */
  public token?: string
  /**
   * Syncano Instance name. See cheatsheet to learn how to create instance
   *
   * @see https://cheatsheet.syncano.io/#cli
   * @type {string}
   */
  public instanceName?: string
  private host?: string
  private apiVersion?: string
  private transformResponse?: (response: axios.AxiosResponse) => any
  private DEFAULT_HEADERS = {
    'Content-Type': 'application/json'
  }

  constructor(
    instanceName: string,
    options: SyncanoClientOptions = {}
  ) {
    this.host = options.host || 'api.syncano.io'
    this.apiVersion = options.apiVersion || 'v3'
    this.token = options.token
    this.transformResponse = options.transformResponse
    this.instanceName = instanceName
  }

  /**
   * Helper method that generates endpoint url
   *
   * @param {string} path Endpoint path in format `socket-name/endpoint-name`
   * @param {object} [params] The params to be appended
   * @returns {string} The formatted url
   */
  public url(path: string, params?: object, options: {
    protocol: 'https' | 'wss'
  } = {
    protocol: 'https'
  }): string {
    let baseURL = `${options.protocol}://${this.host}`
    baseURL = `${baseURL}/${this.apiVersion}/instances/${this.instanceName}/endpoints/sockets/${path}/`
    if (path.startsWith('http') || path.startsWith('/')) {
      baseURL = path
    }
    return buildURL(baseURL, {
      user_key: this.token,
      ...params
    })
  }

  /**
   * Set user api key. Use this to make all request authenticated
   * Call this method without any argument to clear api key
   *
   * @param {string} [token]
   */
  public setToken(token?: string) {
    this.token = token

    return  this
  }

  /**
   * Send request using GET method
   *
   * @param {string} endpoint Endpoint path in format `socket-name/endpoint-name`
   * @param {object} [params={}] Additional request parameters
   * @param {axios.AxiosRequestConfig} [options={}] Additional request options, like headers. See axios config for info
   * @see https://github.com/axios/axios#request-config
   */
  public get(endpoint: string, params?: object, options?: axios.AxiosRequestConfig) {
    this.checkInstanceName()

    return request.get(this.url(endpoint), this.options({params, ...options})).then(this.transform)
  }

  /**
   * Send request using PATCH method
   *
   * @param {string} endpoint Endpoint path in format `socket-name/endpoint-name`
   * @param {any} [data={}] Additional request parameters
   * @param {axios.AxiosRequestConfig} [options={}] Additional request options, like headers. See axios config for info
   * @see https://github.com/axios/axios#request-config
   */
  public patch(endpoint: string, data?: any, options?: axios.AxiosRequestConfig) {
    this.checkInstanceName()

    return request.patch(this.url(endpoint), data, this.options(options)).then(this.transform)
  }

  /**
   * Send request using POST method
   *
   * @param {string} endpoint Endpoint path in format `socket-name/endpoint-name`
   * @param {any} [data={}] Additional request parameters
   * @param {axios.AxiosRequestConfig} [options={}] Additional request options, like headers. See axios config for info
   * @see https://github.com/axios/axios#request-config
   */
  public post(endpoint: string, data?: any, options?: axios.AxiosRequestConfig) {
    this.checkInstanceName()

    return request.post(this.url(endpoint), data, this.options(options)).then(this.transform)
  }

  /**
   * Send request using PUT method
   *
   * @param {string} endpoint Endpoint path in format `socket-name/endpoint-name`
   * @param {any} [data={}] Additional request parameters
   * @param {axios.AxiosRequestConfig} [options={}] Additional request options, like headers. See axios config for info
   * @see https://github.com/axios/axios#request-config
   */
  public put(endpoint: string, data?: any, options?: axios.AxiosRequestConfig) {
    this.checkInstanceName()

    return request.put(this.url(endpoint), data, this.options(options)).then(this.transform)
  }

  /**
   * Send request using DELETE method
   *
   * @param {string} endpoint Endpoint path in format `socket-name/endpoint-name`
   * @param {object} [params={}] Additional request parameters
   * @param {axios.AxiosRequestConfig} [options={}] Additional request options, like headers. See axios config for info
   * @see https://github.com/axios/axios#request-config
   */
  public delete(endpoint: string, params?: object, options?: axios.AxiosRequestConfig) {
    this.checkInstanceName()

    return request.delete(this.url(endpoint), this.options({params, ...options})).then(this.transform)
  }

  /**
   *
   *
   * @param {string} endpoint Endpoint path in format `socket-name/endpoint-name`
   * @param {object} [params] Params to be appended to the URL
   */
  public listen(endpoint: string, params?: object): WebSocket {
    const url = this.url(endpoint, {transport: 'websocket', ...params}, {protocol: 'wss'})

    return new WebSocket(url)
  }

  private transform = (res: axios.AxiosResponse) => {
    if (typeof this.transformResponse === 'function') {
      return this.transformResponse(res)
    }

    return res.data
  }

  private options(options: axios.AxiosRequestConfig = {
    params: {}
  }) {
    return {
      ...options,
      params: {
        user_key: this.token,
        ...options.params
      },
      headers: {
        ...this.DEFAULT_HEADERS,
        ...options.headers
      }
    }
  }

  private checkInstanceName() {
    if (!this.instanceName) {
      throw new Error(`Syncano Client was initialized with invalid instance name: "${this.instanceName}"`)
    }
  }
}

module.exports = SyncanoClient
module.exports.default = SyncanoClient
