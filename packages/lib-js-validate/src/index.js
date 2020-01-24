import isEmpty from 'lodash.isempty'
import Ajv from 'ajv'
import installKeywords from 'ajv-keywords'
import installErrors from 'ajv-errors'
import {socketSchema} from '@syncano/schema'

function normalize (errors) {
  return errors.reduce(
    function (acc, e) {
      acc[e.dataPath.slice(1)] = [e.message.toUpperCase()[0] + e.message.slice(1)]
      return acc
    },
    {}
  )
}

export default class Validator {
  constructor (ctx, config = {
    cacheCompiledSchema: false
  }) {
    if (!ctx) {
      throw new Error('You have to provide Syncano context!')
    }
    this.ctx = ctx
    this.config = config
    this.requestData = ctx.args
    this.endpointDefinition = ctx.meta.metadata
    this.endpointRequestSchema = this.endpointDefinition.inputs
  }

  static validateMainSchema (schemaToTest) {
    const ajv = new Ajv({coerceTypes: true})
    installKeywords(ajv, ['prohibited', 'switch'])

    // Verify only if we can compile schema
    if (schemaToTest.endpoints) {
      Object.keys(schemaToTest.endpoints).forEach(endpoint => {
        if (schemaToTest.endpoints[endpoint].inputs) {
          ajv.compile(schemaToTest.endpoints[endpoint].inputs)
        }
        if (schemaToTest.endpoints[endpoint].outputs) {
          ajv.compile(schemaToTest.endpoints[endpoint].outputs)
        }
      })
    }

    Validator.validate(socketSchema, schemaToTest, this.config)
  }

  static validate (schema, data, config = {}) {
    let validate
    const ajv = new Ajv({
      coerceTypes: true,
      $data: true,
      allErrors: true,
      jsonPointers: true
    })
    if (config.cacheCompiledSchema && typeof global !== 'undefined') {
      if (!global.compiledSchema) {
        installKeywords(ajv)
        installErrors(ajv)
      }
      validate = global.compiledSchema || ajv.compile(schema)
      global.compiledSchema = validate // eslint-disable-line no-global-assign
    } else {
      installKeywords(ajv)
      installErrors(ajv)
      validate = ajv.compile(schema)
    }
    const valid = validate(data)

    if (!valid) {
      const detailsMsg = validate.errors.map(err => {
        return `     - ${err.dataPath} - ${err.message} (${JSON.stringify(err.params)})`
      }).join('\n')

      const error = new Error(`\n\n    Validation error:\n${detailsMsg}\n`)
      error.details = validate.errors
      error.messages = normalize(validate.errors)
      throw error
    }
    return true
  }

  async validateRequest () {
    if (!this.endpointRequestSchema || isEmpty(this.endpointRequestSchema)) {
      return true
    }

    return Validator.validate(this.endpointRequestSchema, this.requestData, this.config)
  }

  async validateResponse (responseType, response) {
    if (!responseType || !response) {
      throw new Error('You have to specify responseType and response argument!')
    }
    const responseSchema = this.endpointDefinition.outputs[responseType]

    const desiredExitCode = responseSchema.exit_code || 200
    const desiredMimetype = responseSchema.mimetype || this.endpointDefinition.outputs.mimetype || 'application/json'

    // We are not validating non-json repsonses
    if (desiredMimetype !== 'application/json') {
      return response
    }

    // Should we validate empty schema?
    if (!responseSchema || !isEmpty(responseSchema)) {
      return true
    }

    if (response.code !== desiredExitCode) {
      throw new Error(`Wrong exit code! Desired code is ${desiredExitCode}, got: ${response.code}`)
    }

    if (response.mimetype !== desiredMimetype) {
      throw new Error(`Wrong mimetype! Desired mimetype is ${desiredMimetype}, got: ${response.mimetype}`)
    }

    Validator.validate(responseSchema, response.data, this.config)
    return response
  }
}
