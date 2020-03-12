import FormData = require('form-data')
import {Headers, Response} from 'node-fetch'
import {ResponseError} from './errors'

export interface JSONResponse extends Response {
  data?: any
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

export function parseJSON(response: JSONResponse): Promise<JSONResponse> {
  const headers: Headers = response.headers
  const mimetype = headers.get('Content-Type')

  if (response.status === 204 || mimetype === null) {
    response.data = undefined

    return Promise.resolve(response)
  }

  // Parse JSON
  if (/^.*\/.*\+json/.test(mimetype) || /^application\/json/.test(mimetype)) {
    return response.json().then((data) => {
      response.data = data

      return response
    })
  }

  // Parse XML and plain text
  if (
    /^text\/.*/.test(mimetype) ||
    /^.*\/.*\+xml/.test(mimetype) ||
    mimetype === 'text/plain'
  ) {
    return response.text().then((data) => {
      response.data = data

      return response
    })
  }

  return response.arrayBuffer().then((data) => {
    response.data = data

    return response
  })
}

export function chunkArray(items: any[], size: number): any[] {
  return items
    .map((e, i) => (i % size === 0 ? items.slice(i, i + size) : null))
    .filter(Boolean)
}

const isUndefined = (value: any) => value === undefined
const isNull = (value: any) => value === null
const isBoolean = (value: any) => typeof value === 'boolean'
const isObject = (value: any) => value === Object(value)
const isArray = (value: any) => Array.isArray(value)
const isDate = (value: any) => value instanceof Date
const isBlob = (value: any) =>
  value &&
  typeof value.size === 'number' &&
  typeof value.type === 'string' &&
  typeof value.slice === 'function'

const isBuffer = (value: any) => Buffer.isBuffer(value)
const isFile = (value: any) =>
  isBuffer(value) &&
  typeof value.filename === 'string' &&
  typeof value.contentType === 'string'

export const objectToFormData = (
  obj: any,
  cfg: {
    indices?: boolean,
    nullsAsUndefined?: boolean,
    booleansAsIntegers?: boolean,
    stringifyArrays?: boolean
  } = {
    indices: false,
    nullsAsUndefined: false,
    booleansAsIntegers: false,
    stringifyArrays: false
  },
  fd = new FormData(),
  pre = ''
) => {
  cfg = cfg || {}
  cfg.indices = isUndefined(cfg.indices) ? false : cfg.indices
  cfg.nullsAsUndefined = isUndefined(cfg.nullsAsUndefined)
    ? false
    : cfg.nullsAsUndefined
  cfg.booleansAsIntegers = isUndefined(cfg.booleansAsIntegers)
    ? false
    : cfg.booleansAsIntegers
  if (isUndefined(obj)) {
    return fd
  } else if (isNull(obj)) {
    if (!cfg.nullsAsUndefined) {
      fd.append(pre, '')
    }
  } else if (isBoolean(obj)) {
    if (cfg.booleansAsIntegers) {
      fd.append(pre, obj ? 1 : 0)
    } else {
      fd.append(pre, obj)
    }
  } else if (isBuffer(obj)) {
    fd.append(pre, obj, {
      contentType: obj.contentType || 'text/plain',
      filename: obj.filename || 'file'
    })
  } else if (isArray(obj)) {
    if (cfg.stringifyArrays) {
      fd.append(pre, JSON.stringify(obj))
    } else {
      obj.forEach((value: any, index: number) => {
        const key = `${pre}[${cfg.indices ? index : ''}]`
        objectToFormData(value, cfg, fd, key)
      })
    }
  } else if (isDate(obj)) {
    fd.append(pre, obj.toISOString())
  } else if (isObject(obj) && !isFile(obj) && !isBlob(obj)) {
    Object.keys(obj).forEach((prop) => {
      const value = obj[prop]

      if (isArray(value)) {
        while (prop.length > 2 && prop.lastIndexOf('[]') === prop.length - 2) {
          prop = prop.substring(0, prop.length - 2)
        }
      }

      const key = pre ? `${pre}[${prop}]` : prop

      objectToFormData(value, cfg, fd, key)
    })
  } else {
    fd.append(pre, obj)
  }

  return fd
}
