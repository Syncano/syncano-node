import Ajv from 'ajv'

export default class Validator {
  constructor (ctx) {
    if (!ctx) {
      throw new Error('You have to provide Syncano context!')
    }
    this.ctx = ctx
    this.requestData = ctx.args
    this.endpointDefinition = ctx.meta.metadata
    this.endpointRequestSchema = this.endpointDefinition.parameters
  }

  static validate (schema, data) {
    const ajv = new Ajv()
    const validate = ajv.compile(schema)
    const valid = validate(data)

    if (!valid) {
      const detailsMsg = validate.errors.map(err => {
        return `     - ${err.message} (${JSON.stringify(err.params)})`
      }).join('\n')

      const error = new Error(`\n\n    Validation error:\n${detailsMsg}\n`)
      error.details = validate.errors
      throw error
    }
    return true
  }

  async validateRequest () {
    // if (!this.endpointRequestSchema || !_.isEmpty(this.endpointRequestSchema)) {
    //   return true
    // }

    const schema = {
      type: 'object',
      properties: this.endpointRequestSchema,
      additionalProperties: false
    }

    return Validator.validate(schema, this.requestData)
  }

  async validateResponse (responseType, response) {
    if (!responseType || !response) {
      throw new Error('You have to specify responseType and response argument!')
    }
    const responseDefinition = this.endpointDefinition.response[responseType]
    const responseDefinitionParameters = responseDefinition.parameters

    const desiredExitCode = responseDefinition.exit_code || 200
    const desiredMimetype = responseDefinition.mimetype || this.endpointDefinition.response.mimetype || 'application/json'

    // We are not validating non-json repsonses
    if (desiredMimetype !== 'application/json') {
      return response
    }

    // Should we validate empty schema?
    // if (!responseDefinitionParameters || !_.isEmpty(responseDefinitionParameters)) {
    //   return true
    // }

    if (response.code !== desiredExitCode) {
      throw new Error(`Wrong exit code! Desired code is ${desiredExitCode}, got: ${response.code}`)
    }

    if (response.mimetype !== desiredMimetype) {
      throw new Error(`Wrong mimetype! Desired mimetype is ${desiredMimetype}, got: ${response.mimetype}`)
    }

    const schema = {
      type: 'object',
      properties: responseDefinitionParameters,
      additionalProperties: false
    }

    Validator.validate(schema, response.data)
    return response
  }
}
