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
    return this.nonInstanceFetch.bind(this)(this.url(), {}, {
      'X-API-KEY': authKey
    })
  }

  public login (
    {email, password}: {email: string, password: string}
  ): Promise<LoginData> {
    return this.nonInstanceFetch.bind(this)(`${this.url()}auth/`, {
      body: JSON.stringify({email, password}),
      method: 'POST'
    })
  }

  public register (
    {email, password}: {email: string, password: string}
  ): Promise<LoginData> {
    return this.nonInstanceFetch.bind(this)(`${this.url()}register/`, {
      body: JSON.stringify({email, password}),
      method: 'POST'
    })
  }

  private url () {
    return `${this.getSyncanoURL()}/account/`
  }
}
