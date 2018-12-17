import * as querystring from 'querystring'
import Data from './data'
import {ACL} from './types'

export interface Group {
  id: number
  label: string
  links: {
      self: string
      users: string
  }
}

export interface User {
  id: number
  created_at: string
  updated_at: string
  revision: number
  acl: ACL
  channel: string|null
  channel_room: string|null
  username: string
  groups: Group[]
  user_key: string
  links: {
    self: string
    groups: string
    'reset-key': string
    [x: string]: string
  }
  [fieldName: string]: any
}

export class User extends Data {
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
    const url = `${this._getInstanceURL(instanceName)}/users/auth/`
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

export default User
