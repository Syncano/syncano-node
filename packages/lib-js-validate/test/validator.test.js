/* global describe it */
import {assert} from 'chai'
import Validator from '../src'
import {generateContext, generateResponse} from './utils'

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

  it('init with context', function (done) {
    const ctx = generateContext()
    const validator = new Validator(ctx) // eslint-disable-line no-unused-vars
    done()
  })

  describe('validateRequest', function () {
    it('validate request with additional arg', function (done) {
      const ctx = generateContext()
      ctx.args = {test: 123}
      const validator = new Validator(ctx)

      validator.validateRequest()
        .catch(err => {
          assert(err.details[0]['keyword'] === 'additionalProperties')
          done()
        })
    })

    it('validate request with wrong arg type', function (done) {
      const ctx = generateContext()
      ctx.args = {postcode: 'string'}
      const validator = new Validator(ctx)

      validator.validateRequest()
        .catch(err => {
          assert(err.details[0]['message'] === 'should be integer')
          done()
        })
    })

    it('validate request without schema', function (done) {
      const ctx = generateContext()

      ctx.args = {postcode: 'string'}
      ctx.meta.metadata.parameters = {}

      const validator = new Validator(ctx)

      validator.validateRequest()
        .catch(err => {
          assert(err.details[0]['keyword'] === 'additionalProperties')
          done()
        })
    })
  })

  describe('validateResponse', function () {
    it('validate response without necessery args', function (done) {
      const ctx = generateContext()
      const validator = new Validator(ctx)

      validator.validateResponse()
        .catch(err => {
          assert(err.message, 'You have to specify responseType and response argument')
          done()
        })
    })

    it('validate success response with right arguments', function (done) {
      const ctx = generateContext()
      const validator = new Validator(ctx)

      validator.validateResponse('success', generateResponse(goodResponseData))
        .then(resp => {
          assert(resp, true)
          done()
        })
    })

    it('validate success response with right arguments but wrong code', function (done) {
      const ctx = generateContext()
      const responseData = generateResponse(goodResponseData)
      responseData.code = '400'
      const validator = new Validator(ctx)

      validator.validateResponse('success', responseData)
        .catch(err => {
          assert.propertyVal(err, 'message', 'Wrong exit code! Desired code is 200, got: 400')
          done()
        })
    })

    it('validate success response with right arguments but wrong mimetype', function (done) {
      const ctx = generateContext()
      const responseData = generateResponse(goodResponseData)
      responseData.mimetype = 'text/plain'
      const validator = new Validator(ctx)

      validator.validateResponse('success', responseData)
        .catch(err => {
          assert.propertyVal(err, 'message', 'Wrong mimetype! Desired mimetype is application/json, got: text/plain')
          done()
        })
    })

    it('validate success response with redundant arg', function (done) {
      const ctx = generateContext()
      const responseData = generateResponse({data: {test: 123}})
      const validator = new Validator(ctx)

      validator.validateResponse('success', responseData)
        .catch(err => {
          assert(err.details[0]['keyword'] === 'additionalProperties')
          done()
        })
    })

    it('validate success response with non-json mimetype', function (done) {
      const ctx = generateContext()

      // non-json mimetype
      ctx.meta.metadata.response.mimetype = 'application/pdf'

      const responseData = generateResponse({data: {test: 123}})
      const validator = new Validator(ctx)

      validator.validateResponse('success', responseData)
      .then(resp => {
        done()
      })
    })

    it('validate success response without definition', function (done) {
      const ctx = generateContext()

      // empty schema
      ctx.meta.metadata.response.success = {}

      const responseData = generateResponse({data: {test: 123}})
      const validator = new Validator(ctx)

      validator.validateResponse('success', responseData)
        .catch(err => {
          assert(err.details[0]['keyword'] === 'additionalProperties')
          done()
        })
    })
  })
})
