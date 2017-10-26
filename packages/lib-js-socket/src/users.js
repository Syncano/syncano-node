import querystring from 'querystring'
import Data from './data'

/**
 * Syncano users query builder
 * @property {Function}
 */
class Users extends Data {
  url (id) {
    const {instanceName} = this.instance
    const url = `${this._getInstanceURL(instanceName)}/users/${id
      ? id + '/'
      : ''}`
    const query = querystring.stringify(this.query)

    return query ? `${url}?${query}` : url
  }
}

export default Users
