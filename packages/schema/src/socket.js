export default {
  '$schema': 'http://json-schema.org/draft-07/schema#',
  definitions: {
    description: {
      title: 'The description schema',
      type: 'string',
      maxLength: 256
    }
  },
  properties:
  {
    description: {
      '$ref': '#/definitions/description'
    },
    name: {
      title: 'Name of the socket',
      type: 'string',
      maxLength: 64,
      pattern: '^[?:a-z0-9-_]*$'
    },
    keywords: {
      title: 'Keywords',
      type: 'array',
      maxItems: 5,
      uniqueItems: true,
      items: {
        type: 'string',
        maxLength: 32
      }
    },
    runtime: {
      title: 'Runtime',
      type: 'string',
      enum: [ 'nodejs_v6', 'nodejs_v8' ]
    },
    endpoints: {
      type: 'object',
      patternProperties: {
        '.*': {
          type: 'object',
          properties: {
            description: {
              '$ref': '#/definitions/description'
            },
            inputs: {
              type: 'object'
            },
            outputs: {
              type: 'object'
            }
          }
        }
      }
    },
    event_handlers: {
      type: 'object'
    },
    events: {
      type: 'object'
    },
    config: {
      type: 'object',
      properties: {
        description: {'$ref': '#/definitions/description'}
      }
    },
    classes: {
      type: 'object',
      patternProperties: {
        '.*': {
          type: 'array',
          items: {
            type: 'object',
            'switch': [
              {
                if: {
                  properties: {
                    type: {
                      oneOf: [
                        {const: 'reference'},
                        {const: 'relation'}
                      ]
                    }
                  }
                },
                then: { required: ['name', 'type', 'target'] },
                continue: true
              },
              {
                if: {
                  properties: {
                    type: {
                      oneOf: [
                        {const: 'text'},
                        {const: 'file'},
                        {const: 'object'}
                      ]
                    }
                  }
                },
                then: {
                  prohibited: ['filter_index', 'order_index'],
                  errorMessage: {
                    prohibited: 'file, text and object fields can not have any index'
                  }
                },
                continue: true
              },
              {
                if: {
                  properties: {
                    type: {
                      oneOf: [
                        {const: 'array'},
                        {const: 'geopoint'},
                        {const: 'relation'}
                      ]
                    }
                  }
                },
                then: {
                  prohibited: ['order_index', 'unique'],
                  errorMessage: {
                    prohibited: 'array, geopoint and relation can not have order_index or unique'
                  }
                },
                continue: true
              },
              {
                if: { properties: { type: { const: 'reference' } } },
                then: {
                  prohibited: ['order_index'],
                  errorMessage: {
                    prohibited: 'reference can not have order_index'
                  }
                },
                continue: true
              }
            ],
            properties: {
              name: {
                type: 'string'
              },
              type: {
                type: 'string',
                enum: [
                  'string',
                  'text',
                  'integer',
                  'float',
                  'boolean',
                  'datetime',
                  'file',
                  'reference',
                  'relation',
                  'array',
                  'object',
                  'geopoint'
                ]
              }
            },
            required: ['name', 'type']
          }
        }
      }
    }
  },
  required: [ 'name', 'description' ]
}
