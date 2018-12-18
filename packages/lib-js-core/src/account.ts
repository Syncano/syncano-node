import {ResponseError} from './errors'
import {QueryBuilder} from './query-builder'
import {AccountOwner, LoginData} from './types'

/**
 * Syncano account query builder
 * @property {Function}
 */
export class AccountClass extends QueryBuilder {
  /**
   * Get details of Syncano account
   */
  public get (authKey: string): Promise<AccountOwner> {
    const fetch = this.nonInstanceFetch.bind(this)
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': authKey
      }

      fetch(this.url(), {}, headers)
        .then((res: AccountOwner)  => resolve(res))
        .catch((err: ResponseError) => reject(err))
    })
  }

  public login (
    {email, password}: {email: string, password: string}
  ): Promise<LoginData> {
    const fetch = this.nonInstanceFetch.bind(this)
    return new Promise((resolve, reject) => {
      const options = {
        body: JSON.stringify({email, password}),
        method: 'POST'
      }
      fetch(`${this.url()}auth/`, options)
        .then((res: LoginData) => resolve(res))
        .catch((err: ResponseError) => reject(err))
    })
  }

  public register (
    {email, password}: {email: string, password: string}
  ): Promise<LoginData> {
    const fetch = this.nonInstanceFetch.bind(this)
    return new Promise((resolve, reject) => {
      const options = {
        body: JSON.stringify({email, password}),
        method: 'POST'
      }

      fetch(`${this.url()}register/`, options)
        .then((res: LoginData) => resolve(res))
        .catch((err: ResponseError) => reject(err))
    })
  }

  private url () {
    return `${this.getSyncanoURL()}/account/`
  }
}
