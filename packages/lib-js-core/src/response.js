import get from 'lodash.get'

/**
 * Unified response helper
 * @property {Function}
 */

class Response {
  constructor (
    instance,
    content = null,
    status = 200,
    mimetype = 'text/plain',
    headers = {}
  ) {
    this._content = content
    this._status = status
    this._mimetype = mimetype
    this._headers = headers

    let setResponse = instance.setResponse || global.setResponse
    let HttpResponse = instance.HttpResponse || global.HttpResponse

    const args = [this._status, this._content, this._mimetype, this._headers]

    if (setResponse === undefined) {
      return
    }

    setResponse(new HttpResponse(...args))
  }
}

export default config => {
  const response = (content, status, mimetype, headers) =>
    new Response(config, content, status, mimetype, headers)

  const responses = get(config, 'meta.metadata.response', {})

  mapYamlResponsesToMethods(response, responses, config)

  response.header = (key, value) => {
    response._headers = {
      ...response._headers,
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
      response._headers
    )

  return response
}

function mapYamlResponsesToMethods (response, responses, config) {
  Object.keys(responses).forEach(name => {
    const {mimetype = 'application/json', exit_code: status = 200} = responses[name]
    const isJSON = mimetype === 'application/json'

    response[name] = content =>
      new Response(
        config,
        isJSON ? JSON.stringify(content) : content,
        status,
        mimetype,
        response._headers
      )
  })
}
