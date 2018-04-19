const get = require('lodash.get')

/**
 * Unified response helper
 * @property {Function}
 */

export class Response {
  private headers: {}
  private mimetype: string
  private status: number
  private content: any

  constructor (
    instance: any,
    content: any = null,
    status = 200,
    mimetype = 'text/plain',
    headers = {}
  ) {
    this.content = content
    this.status = status
    this.mimetype = mimetype
    this.headers = headers

    const setResponse = instance.setResponse || (global as any).setResponse
    const HttpResponse = instance.HttpResponse || (global as any).HttpResponse

    const args = [this.status, this.content, this.mimetype, this.headers]

    if (setResponse === undefined) {
      return
    }

    setResponse(new HttpResponse(...args))
  }
}

export type ResponseFn = (content?: any, status?: number, mimetype?: string, headers?: any) => Response
export interface CustomResponse extends ResponseFn {
  headers?: {}
  header?: (key: string, value: string) => CustomResponse
  json?: (content?: any, status?: 200) => Response
  [x: string]: any
}

export default (config: any) => {
  const response: CustomResponse = (content?: any, status?: number, mimetype?: string, headers?: any) =>
    new Response(config, content, status, mimetype, headers)

  const responses = get(config, 'meta.metadata.outputs', {})

  mapYamlResponsesToMethods(response, responses, config)

  response.header = (key, value) => {
    response.headers = {
      ...response.headers,
      [key]: value
    }

    return response
  }

  response.json = (content, status = 200) =>
    new Response(
      config,
      JSON.stringify(content),
      status,
      'application/json',
      response.headers
    )

  return response
}

function mapYamlResponsesToMethods(response: CustomResponse, responses: any[], config: any) {
  Object.keys(responses).forEach((name) => {
    const {mimetype = 'application/json', exit_code: status = 200} = responses[name]
    const isJSON = mimetype === 'application/json'

    response[name] = (content: any) =>
      new Response(
        config,
        isJSON ? JSON.stringify(content) : content,
        status,
        mimetype,
        response._headers
      )
  })
}
