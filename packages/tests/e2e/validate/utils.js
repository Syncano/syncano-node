import faker from 'faker'

export const generateResponse = (response) => {
  return Object.assign({
    code: 200,
    data: {},
    mimetype: 'application/json'
  }, response)
}

export const generateContext = () => {
  return {
    meta:
    {
      socket: 'norwegian-postcode',
      api_host: 'api.syncano.io',
      token: 'token',
      instanc: 'syncnao-instance',
      debug: process.env.DEBUG || false,
      executor: 'norwegian-postcode/search',
      executed_by: 'socket_endpoint',
      request: {
        REQUEST_METHOD: 'POST',
        PATH_INFO: '/v2/instances/withered-voice-2245/endpoints/sockets/norwegian-postcode/search/',
        HTTP_USER_AGENT: faker.internet.userAgent(),
        HTTP_CONNECTION: 'close',
        REMOTE_ADDR: faker.internet.ip(),
        HTTP_HOST: 'api.syncano.io',
        HTTP_UPGRADE_INSECURE_REQUESTS: '1',
        HTTP_ACCEPT: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        HTTP_ACCEPT_LANGUAGE: 'en,en-US;q=0.8,pl;q=0.6',
        HTTP_ACCEPT_ENCODING: 'gzip, deflate, br'
      },
      metadata: {
        'description': 'Search for data based on given postcode',
        'parameters': {
          'postcode': {
            'type': 'integer',
            'description': 'Post code',
            'example': 113
          }
        },
        'response': {
          'success': {
            'description': 'Successful query',
            'parameters': {
              'city': {
                'typeOf': 'string'
              },
              'municipality': {
                'type': 'string'
              },
              'county': {
                'type': 'string'
              },
              'category': {
                'type': 'string'
              }
            }
          },
          'notFound': {
            'description': 'Post code not found',
            'exit_code': 404,
            'parameters': {
              'message': {
                'type': 'string'
              }
            }
          },
          'fail': {
            'description': 'Zip generation failed',
            'exit_code': 400,
            'parameters': {
              'message': {
                'type': 'string'
              }
            }
          }
        }
      }
    }
  }
}
