import querystring from 'querystring'
import Data from './data'

/**
 * Syncano users query builder
 * @property {Function}
 */
class Users extends Data {
  url (id, apiVersion) {
    const {instanceName} = this.instance
    const url = `${this._getInstanceURL(instanceName, apiVersion)}/users/${id
      ? id + '/'
      : ''}`
    const query = querystring.stringify(this.query)

    return query ? `${url}?${query}` : url
  }

  authUrl () {
    const {instanceName} = this.instance
    const url = `${this._getInstanceURL(instanceName)}/users/auth/`
    const query = querystring.stringify(this.query)

    return query ? `${url}?${query}` : url
  }

  login ({username, password}) {
    const fetch = this.fetch.bind(this)

    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        body: JSON.stringify({ username, password })
      }
      fetch(`${this.authUrl()}`, options)
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  }
}

export default Users
