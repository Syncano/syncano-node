import QueryBuilder from './query-builder'

/**
 * Syncano account query builder
 * @property {Function}
 */
class Instance extends QueryBuilder {
  /**
   * Create Syncano instance
   *
   * @example {@lang javascript}
   * const instance = await instance.create({name: 'new-instance', description: 'description'})
   */
  public create (params: {
    name: string,
    description?: string
  }): Promise<any> {
    const fetch = this.nonInstanceFetch.bind(this)

    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      const options = {
        body: JSON.stringify(params),
        method: 'POST'
      }
      fetch(this.url(), options, headers)
        .then(resolve)
        .catch(reject)
    })
  }
  /**
   * Get Syncano instance details
   *
   * @example {@lang javascript}
   * const instance = await instance.get('instance-name')
   */
  public get (instanceName: string): Promise<any> {
    const fetch = this.nonInstanceFetch.bind(this)

    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      fetch(this.url(instanceName), {}, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  /**
   * List Syncano instances
   *
   * @example {@lang javascript}
   * const instance = await instance.list()
   */
  public list (): Promise<any> {
    const fetch = this.nonInstanceFetch.bind(this)

    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      fetch(this.url(), {}, headers)
        .then((res: any) => resolve(res.objects))
        .catch(reject)
    })
  }

  /**
   * Delete Syncano instance
   *
   * @example {@lang javascript}
   * await instance.delete('new-instance')
   */
  public delete (instanceName: string): Promise<any> {
    const fetch = this.nonInstanceFetch.bind(this)

    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      const options = {
        method: 'DELETE'
      }
      fetch(this.url(instanceName), options, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  private url (instanceName?: string) {
    const baseUrl = `${this._getSyncanoURL()}/instances/`
    return instanceName ? `${baseUrl}${instanceName}/` : baseUrl
  }
}

export default Instance
