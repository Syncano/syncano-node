var Ajv = require('ajv')
var ajv = new Ajv()

const schema = {
  'type': 'object',
  'properties': {
    'city': {
      format: 'city'
    },
    'municipality': {
      'type': 'string'
    },
    'municipality_id': {
      'type': 'string'
    },
    'type': {
      'type': 'string'
    }
  }
}

const data = {
  city: 'Oslo',
  municipality: 'aaa',
  county: 'Oslo',
  category: 'G'
}

ajv.addFormat('city', function (city) {
  console.log('XXX', city)
  return true
})
var validate = ajv.compile(schema)
var valid = validate(data)

console.log('XXX')
if (!valid) {
  console.log(validate.errors)
} else {
  console.log(valid)
}
