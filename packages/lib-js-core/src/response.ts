const get = require('lodash.get')

// tslint:disable-next-line:max-line-length
export type HTTPStatus = 100|101|102|200|201|202|203|204|205|206|207|208|226|300|301|302|303|304|305|307|308|400|401|402|403|404|405|406|407|408|409|410|411|412|413|414|415|416|417|418|421|422|423|424|426|428|429|431|444|451|499|500|501|502|503|504|505|506|507|508|510|511|599

export class Response {
  private headers: {[x: string]: string}
  private mimetype: string
  private status: number
  private content: any

  constructor (
    instance: any,
    content: any = null,
    status: HTTPStatus = 200,
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

export type ResponseFn = (
  content?: any,
  status?: HTTPStatus,
  mimetype?: string,
  headers?: {[x: string]: string}
) => Response

export interface CustomResponse extends ResponseFn {
  header: (key: string, value: string) => CustomResponse
  json: (content?: any, status?: 200) => Response
  [x: string]: any
}

export default (config: any) => {
  const response: CustomResponse = (
    content?: any,
    status?: HTTPStatus,
    mimetype?: string,
    headers?: {[x: string]: string}
  ) =>
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
