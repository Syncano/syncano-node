import QueryBuilder from './query-builder'

/**
 * Syncano account query builder
 * @property {Function}
 */
class Account extends QueryBuilder {
  url () {
    return `${this._getSyncanoURL()}/account/`
  }

  /**
   * Get details of Syncano account
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * const account = await account.get('0aad29dd0be2bcebb741525b9c5901e55cf43e98')
   */
  get (authKey) {
    const fetch = this.nonInstanceFetch.bind(this)
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': authKey
      }

      fetch(this.url(), {}, headers)
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  }

  login ({email, password}) {
    const fetch = this.nonInstanceFetch.bind(this)
    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }
      fetch(`${this.url()}auth/`, options)
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  }

  register ({email, password}) {
    const fetch = this.nonInstanceFetch.bind(this)
    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }

      fetch(`${this.url()}register/`, options)
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  }
}

export default Account
