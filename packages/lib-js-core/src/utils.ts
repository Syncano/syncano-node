import {Headers, Response} from 'node-fetch'
import { ResponseError } from './errors'

export interface JSONResponse extends Response {
  data: any
}

export function checkStatus(response: JSONResponse) {
  if (response.status >= 200 && response.status < 300) {
    return response.data
  }

  let error

  try {
    if (typeof response.data === 'object' && response.data !== null) {
      if (response.data.detail) {
        error = new ResponseError(response.data.detail)
      } else if (response.data.query) {
        error = new ResponseError(response.data.query)
      } else {
        const key = Object.keys(response.data)[0]

        error = new ResponseError(`${key}: ${response.data[key]}`)
      }
    } else {
      error = new ResponseError(response.data.detail)
    }
  } catch (err) {
    error = new ResponseError(response.statusText)
  }

  error.response = response
  error.data = response.data
  error.status = response.status
  error.headers = response.headers
  error.size = response.size
  error.timeout = response.timeout
  error.url = response.url

  throw error
}

export function parseJSON(response: Response): Promise<JSONResponse> {
  const headers: Headers = response.headers
  const mimetype = headers.get('Content-Type')

  if (response.status === 204 || mimetype === null) {
    return Promise.resolve(Object.assign(response, {data: undefined}))
  }

  // Parse JSON
  if (/^.*\/.*\+json/.test(mimetype) || /^application\/json/.test(mimetype)) {
    return response.json().then((data) => Object.assign(response, {data}))
  }

  // Parse XML and plain text
  if (
    /^text\/.*/.test(mimetype) ||
    /^.*\/.*\+xml/.test(mimetype) ||
    mimetype === 'text/plain'
  ) {
    return response.text().then((data) => Object.assign(response, {data}))
  }

  return response.arrayBuffer().then((data) => Object.assign(response, {data}))
}
