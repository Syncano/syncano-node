import {Headers} from 'node-fetch'
import {JSONResponse} from './utils'

export class SyncanoError extends Error {
  constructor(m: string) {
    super(m)
    Object.setPrototypeOf(this, ResponseError.prototype)
    this.name = 'SyncanoError'
  }
}

export class NotFoundError extends Error {
  constructor(m = 'No results for given query.') {
    super(m)
    Object.setPrototypeOf(this, ResponseError.prototype)
    this.name = 'NotFoundError'
  }
}

export class ResponseError extends Error {
  public url?: string
  public timeout?: number
  public size?: number
  public headers?: Headers
  public status?: number
  public data: any
  public response?: JSONResponse

  constructor(m: string) {
    super(m)
    Object.setPrototypeOf(this, ResponseError.prototype)
  }
}
