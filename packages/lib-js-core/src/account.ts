import { ResponseError } from './errors'
import QueryBuilder from './query-builder'
import { JSONResponse } from './utils'

/**
 * Syncano account query builder
 * @property {Function}
 */
class Account extends QueryBuilder {
  public url () {
    return `${this._getSyncanoURL()}/account/`
  }

  /**
   * Get details of Syncano account
   *
   * @example {@lang javascript}
   * const account = await account.get('0aad29dd0be2bcebb741525b9c5901e55cf43e98')
   */
  public get (authKey: string): Promise<any> {
    const fetch = this.nonInstanceFetch.bind(this)
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': authKey
      }

      fetch(this.url(), {}, headers)
        .then((res: JSONResponse)  => resolve(res))
        .catch((err: ResponseError) => reject(err))
    })
  }

  public login ({email, password}: {email: string, password: string}) {
    const fetch = this.nonInstanceFetch.bind(this)
    return new Promise((resolve, reject) => {
      const options = {
        body: JSON.stringify({ email, password }),
        method: 'POST'
      }
      fetch(`${this.url()}auth/`, options)
        .then((res: JSONResponse) => resolve(res))
        .catch((err: ResponseError) => reject(err))
    })
  }

  public register ({email, password}: {email: string, password: string}) {
    const fetch = this.nonInstanceFetch.bind(this)
    return new Promise((resolve, reject) => {
      const options = {
        body: JSON.stringify({ email, password }),
        method: 'POST'
      }

      fetch(`${this.url()}register/`, options)
        .then((res: JSONResponse) => resolve(res))
        .catch((err: ResponseError) => reject(err))
    })
  }
}

export default Account
