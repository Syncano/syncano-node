import QueryBuilder from './query-builder'

/**
 * Syncano account query builder
 * @property {Function}
 */
class Instance extends QueryBuilder {
  url(instanceName) {
    const baseUrl = `${this._getSyncanoURL()}/instances/`

    return instanceName ? `${baseUrl}${instanceName}/` : baseUrl
  }

  /**
   * Create Syncano instance
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * const instance = await instance.create({name: 'new-instance', description: 'description'})
   */
  create(params) {
    const fetch = this.nonInstanceFetch.bind(this)

    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': this.instance.accountKey
      }
      const options = {
        method: 'POST',
        body: JSON.stringify(params)
      }
      fetch(this.url(), options, headers)
        .then(resolve)
        .catch(reject)
    })
  }

  /**
   * Delete Syncano instance
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * await instance.delete('new-instance')
   */
  delete(instanceName) {
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
}

export default Instance
