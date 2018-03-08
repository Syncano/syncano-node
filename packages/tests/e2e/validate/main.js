/* global describe it */
import {assert} from 'chai'
import Validator from '../../../lib-js-validate/src'
import {generateContext, generateResponse} from '@syncano/test-tools'

describe('Validator', function () {
  const goodResponseData = {
    data: {
      city: 'test',
      municipality: 'test',
      county: 'test',
      category: 'test'
    }
  }

  it('init validator without context', function (done) {
    try {
      const validator = new Validator() // eslint-disable-line no-unused-vars
    } catch (err) {
      assert.propertyVal(err, 'message', 'You have to provide Syncano context!')
      done()
    }
  })

  it('init with context', async () => {
    const ctx = generateContext()
    const validator = new Validator(ctx) // eslint-disable-line no-unused-vars
  })

  describe('validateRequest', function () {
    it('validate request with wrong arg type', async () => {
      const ctx = generateContext()
      ctx.args = {postcode: 'string'}
      const validator = new Validator(ctx)

      try {
        await validator.validateRequest()
      } catch (err) {
        assert(err.details[0]['message'] === 'should be integer')
      }
    })

    it('validate request without schema', async () => {
      const ctx = generateContext()
      ctx.meta.metadata.inputs = {}

      const validator = new Validator(ctx)
      await validator.validateRequest()
    })
  })

  describe('validateResponse', function () {
    it('validate response without necessery args', async () => {
      const ctx = generateContext()
      const validator = new Validator(ctx)

      try {
        await validator.validateResponse()
      } catch (err) {
        assert(err.message, 'You have to specify responseType and response argument')
      }
    })

    it('validate success response with right arguments', async () => {
      const ctx = generateContext()
      const validator = new Validator(ctx)

      await validator.validateResponse('success', generateResponse(goodResponseData))
    })

    it('validate success response with right arguments but wrong code', async () => {
      const ctx = generateContext()
      const responseData = generateResponse(goodResponseData)
      responseData.code = '400'
      const validator = new Validator(ctx)

      try {
        await validator.validateResponse('success', responseData)
      } catch (err) {
        assert.propertyVal(err, 'message', 'Wrong exit code! Desired code is 200, got: 400')
      }
    })

    it('validate success response with right arguments but wrong mimetype', async () => {
      const ctx = generateContext()
      const responseData = generateResponse(goodResponseData)
      responseData.mimetype = 'text/plain'
      const validator = new Validator(ctx)

      try {
        await validator.validateResponse('success', responseData)
      } catch (err) {
        assert.propertyVal(err, 'message', 'Wrong mimetype! Desired mimetype is application/json, got: text/plain')
      }
    })

    it('validate success response with redundant arg', async () => {
      const ctx = generateContext()
      const responseData = generateResponse({data: {test: 123}})
      const validator = new Validator(ctx)

      await validator.validateResponse('success', responseData)
    })

    it('validate success response with non-json mimetype', async () => {
      const ctx = generateContext()

      // non-json mimetype
      ctx.meta.metadata.outputs.mimetype = 'application/pdf'

      const responseData = generateResponse({data: {test: 123}})
      const validator = new Validator(ctx)

      await validator.validateResponse('success', responseData)
    })

    it('validate success response without definition', async () => {
      const ctx = generateContext()

      // empty schema
      ctx.meta.metadata.outputs.success = {}

      const responseData = generateResponse({data: {test: 123}})
      const validator = new Validator(ctx)

      await validator.validateResponse('success', responseData)
    })
  })
})
