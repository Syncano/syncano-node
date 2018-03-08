/* global describe it */
import fs from 'fs'
import path from 'path'
import YAML from 'js-yaml'
import {assert} from 'chai'
import {generateContext} from '@syncano/test-tools'
import Validator from '@syncano/validate'

// Helper to get inputs schema from file
const validateInputs = (schemaFileToTest, data) => {
  const schema = YAML.load(
    fs.readFileSync(
      path.join(__dirname, 'definitions', `${schemaFileToTest}.yml`
    ), 'utf8')
  )

  Object.keys(data).forEach(endpoint => {
    const ctx = generateContext()
    ctx.args = data[endpoint]
    ctx.inputs = schema.endpoints[endpoint].inputs
    new Validator(ctx).validateRequest()
    Validator.validate(schema.endpoints[endpoint].inputs, data[endpoint])
  })
}

// Helper to get schema from file
const getSchema = (schemaFileToTest) => {
  return YAML.load(
    fs.readFileSync(
      path.join(__dirname, 'definitions', `${schemaFileToTest}.yml`
    ), 'utf8')
  )
}

describe('Schema', function () {
  describe('main schema', () => {
    it('valid schema', () => {
      try {
        Validator.validateMainSchema(getSchema('valid_1'))
      } catch (err) {
        console.log(err)
      }
    })

    it('invalid inputs (non-existing format)', () => {
      try {
        Validator.validateMainSchema(getSchema('invalid_inputs_format'))
        assert()
      } catch (err) {
        assert(err.message === 'unknown format "test" is used in schema at path "#"')
      }
    })

    it('invalid inputs (non-existing format)', () => {
      try {
        // validateMainSchema('invalid_inputs_format')
        Validator.validateMainSchema(getSchema('invalid_inputs_format'))
        assert()
      } catch (err) {
        assert(err.message === 'unknown format "test" is used in schema at path "#"')
        return
      }
      assert()
    })

    it('invalid runtime', () => {
      try {
        Validator.validateMainSchema(getSchema('invalid_runtime'))
        assert()
      } catch (err) {
        assert(err.details[0].message === 'should be equal to one of the allowed values')
      }
    })

    it('invalid version', () => {
      try {
        Validator.validateMainSchema(getSchema('invalid_version'))
        assert()
      } catch (err) {
        assert(err.details[0].message.match(/should match pattern/))
      }
    })

    it('invalid amount of keywords', () => {
      try {
        Validator.validateMainSchema(getSchema('invalid_keywords_amount'))
        assert()
      } catch (err) {
        assert(err.details[0].message.match(/should NOT have more than 5 items/))
      }
    })

    it('invalid keywords', () => {
      try {
        Validator.validateMainSchema(getSchema('invalid_keywords'))
        assert()
      } catch (err) {
        assert(err.details[0].message.match(/should NOT be longer than 12 character/))
      }
    })

    it('invalid classes', () => {
      try {
        Validator.validateMainSchema(getSchema('invalid_classes'))
        assert()
      } catch (err) {
        assert(err.details[0].message.match(/should be array/))
      }
    })

    it('invalid classes (missing required fields)', () => {
      try {
        Validator.validateMainSchema(getSchema('invalid_classes_required'))
        assert()
      } catch (err) {
        assert(err.details[0].message.match(/should have required property 'type'/))
      }
    })

    it('invalid classes (wrong type)', () => {
      try {
        Validator.validateMainSchema(getSchema('invalid_classes_wrong_type'))
        assert()
      } catch (err) {
        assert(err.details[0].message.match(/should be equal to one of the allowed values/))
      }
    })

    it('invalid classes (target required - reference)', () => {
      try {
        Validator.validateMainSchema(getSchema('invalid_classes_target_required_reference'))
        assert()
      } catch (err) {
        assert(err.details[0].message.match(/should have required property 'target'/))
      }
    })

    it('invalid classes (target required - relation)', () => {
      try {
        Validator.validateMainSchema(getSchema('invalid_classes_target_required_relation'))
        assert()
      } catch (err) {
        assert(err.details[0].message.match(/should have required property 'target'/))
      }
    })

    it('invalid classes (index on wrong type)', () => {
      try {
        Validator.validateMainSchema(getSchema('invalid_classes_index_on_wrong_type'))
        assert()
      } catch (err) {
        assert(err.details.pop().message.match(/file, text and object fields can not have any index/))
      }
    })

    it('invalid classes (reference order index)', () => {
      try {
        Validator.validateMainSchema(getSchema('invalid_classes_reference_order_index'))
        assert()
      } catch (err) {
        assert(err.messages['classes/book/0'][0] === 'Reference can not have order_index')
        assert(err.details.pop().message.match(/reference can not have order_index/))
      }
    })

    it('invalid classes (array wrong index)', () => {
      try {
        Validator.validateMainSchema(getSchema('invalid_classes_array_index'))
        assert()
      } catch (err) {
        assert(err.messages['classes/book/0'][0] === 'Array, geopoint and relation can not have order_index or unique')
        assert(err.details.pop().message.match(/array, geopoint and relation can not have order_index or unique/))
      }
    })
  })
  describe('inputs', () => {
    it('valid', () => {
      const data = {
        hello: {
          firstname: 'Joe', lastname: 'Doe'
        }
      }
      validateInputs('valid_1', data)
    })
    it('invalid - missing required param', () => {
      const data = {
        hello: {
          lastname: 'Doe'
        }
      }
      try {
        validateInputs('valid_1', data)
      } catch (err) {
        assert(err.messages[''][0] === 'Should have required property \'firstname\'')
        assert(err.details[0].params.missingProperty === 'firstname')
      }
    })
    it('invalid - incorrect param type', () => {
      const data = {
        hello: {
          firstname: 'Joe',
          lastname: 123
        }
      }
      try {
        validateInputs('valid_1', data)
      } catch (err) {
        assert(err.details[0].message === 'should be string')
      }
    })
  })
})
