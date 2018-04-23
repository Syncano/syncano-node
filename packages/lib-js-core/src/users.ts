import * as querystring from 'querystring'
import Data from './data'

/**
 * Syncano users query builder
 * @property {Function}
 */
class Users extends Data {
  // tslint:disable-next-line:variable-name
  public login ({username, password}: {username: string, password: string}) {
    const fetch = this.fetch.bind(this)
    return new Promise((resolve, reject) => {
      const options = {
        body: JSON.stringify({ username, password }),
        method: 'POST'
      }
      fetch(`${this.url()}auth/`, options)
        .then((res: any) => resolve(res))
        .catch((err: any) => reject(err))
    })
  }

  protected url (id?: number): string {
    const {instanceName} = this.instance
    const url = `${this.getInstanceURL(instanceName)}/users/${id
      ? id + '/'
      : ''}`
    const query = querystring.stringify(this.query)

    return query ? `${url}?${query}` : url
  }
}

export default Users
