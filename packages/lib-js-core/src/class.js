import QueryBuilder from './query-builder'

/**
 * Syncano account query builder
 * @property {Function}
 */
class Class extends QueryBuilder {
  url (className) {
    const {instanceName} = this.instance
    const baseUrl = `${this._getInstanceURL(instanceName)}/classes/`

    return className ? `${baseUrl}${className}/` : baseUrl
  }

  /**
   * Create Syncano class
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * const instance = await class.create({name: 'class_name'})
   */
  create (params) {
    const fetch = this.fetch.bind(this)

    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        body: JSON.stringify(params)
      }

      fetch(this.url(), options)
        .then(resolve)
        .catch(reject)
    })
  }

  /**
   * Delete Syncano class
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * await syncanoClass.delete('class_name')
   */
  delete (className) {
    const fetch = this.fetch.bind(this)

    return new Promise((resolve, reject) => {
      const options = {
        method: 'DELETE'
      }

      fetch(this.url(className), options)
        .then(resolve)
        .catch(reject)
    })
  }
}

export default Class
