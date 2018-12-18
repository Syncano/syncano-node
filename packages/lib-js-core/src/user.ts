import * as querystring from 'querystring'
import {DataClass} from './data'
import {User} from './types'

export class UserClass extends DataClass {
  /**
   * Login Syncano user
   *
   * @param param.username
   * @param param.password
   */
  public login (
    {username, password}: {username: string, password: string}
  ): Promise<User> {
    const fetch = this.fetch.bind(this)

    return new Promise((resolve, reject) => {
      const options = {
        body: JSON.stringify({username, password}),
        method: 'POST'
      }
      fetch(this.authUrl(), options)
        .then((res: any) => resolve(res))
        .catch((err: any) => reject(err))
    })
  }

  protected authUrl () {
    const {instanceName} = this.instance
    const url = `${this.getInstanceURL(instanceName)}/users/auth/`
    const query = querystring.stringify(this.query)

    return query ? `${url}?${query}` : url
  }

  protected url (id?: number, apiVersion?: string): string {
    const {instanceName} = this.instance
    const url = `${this.getInstanceURL(instanceName, apiVersion)}/users/${id
      ? id + '/'
      : ''}`
    const query = querystring.stringify(this.query)

    return query ? `${url}?${query}` : url
  }
}
