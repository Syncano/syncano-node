import {RequestInit} from 'node-fetch'
import {QueryBuilder} from './query-builder'
import {objectToFormData} from './utils'

export class EndpointClass extends QueryBuilder {
  public invalidate (endpoint: string) {
    return this.fetch(`${this.url(endpoint)}invalidate/`, {method: 'POST'})
  }
  /**
   * Send POST request to Syncano Endpoint
   *
   * @param endpoint Endpoint path in format `socket-name/endpoint-name`. For example: `user-auth/register`.
   * @param [data={}] Data passed to endpoint.
   * @param [options={}] node-fetch options
   */
  public post (endpoint: string, body = {}, options = {}) {
    const fetch = this.fetch.bind(this)
    const formObject = objectToFormData(body)
    const headers = formObject.getHeaders()

    return fetch(this.url(endpoint), {
      body: formObject,
      method: 'POST',
      ...options
    }, headers)
  }

  /**
   * Send GET request to Syncano Endpoint
   *
   * @param endpoint Endpoint path in format `socket-name/endpoint-name`. For example: `user-auth/register`.
   * @param [data={}] Data passed to endpoint.
   * @param [options={}] node-fetch options
   */
  public get (endpoint: string, data: any = {}, options: RequestInit = {}) {
    return this.post(endpoint, {...data, _method: 'GET'}, options)
  }

  /**
   * Send DELETE request to Syncano Endpoint
   *
   * @param endpoint Endpoint path in format `socket-name/endpoint-name`. For example: `user-auth/register`.
   * @param [data={}] Data passed to endpoint.
   * @param [options={}] node-fetch options
   */
  public delete (endpoint: string, data: any = {}, options: RequestInit = {}) {
    return this.post(endpoint, {...data, _method: 'DELETE'}, options)
  }

  /**
   * Send PUT request to Syncano Endpoint
   *
   * @param endpoint Endpoint path in format `socket-name/endpoint-name`. For example: `user-auth/register`.
   * @param [data={}] Data passed to endpoint.
   * @param [options={}] node-fetch options
   */
  public put (endpoint: string, data: any = {}, options: RequestInit = {}) {
    return this.post(endpoint, {...data, _method: 'PUT'}, options)
  }

  /**
   * Send PATCH request to Syncano Endpoint
   *
   * @param endpoint Endpoint path in format `socket-name/endpoint-name`. For example: `user-auth/register`.
   * @param [data={}] Data passed to endpoint.
   * @param [options={}] node-fetch options
   */
  public patch (endpoint: string, data: any = {}, options: RequestInit = {}) {
    return this.post(endpoint, {...data, _method: 'PATCH'}, options)
  }

  private url (endpoint: string) {
    const {instanceName} = this.instance

    return `${this.getInstanceURL(instanceName, 'v3')}/endpoints/sockets/${endpoint}/`
  }
}
