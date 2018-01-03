import faker from 'faker'
// import fetch from 'node-fetch'

export default () => {
  // const { account } = syncano(ctx, syncano)
  //
  // const syncanoCall = function (endpoint, params, key) {
  //   return fetch(`https://${process.env.SYNCANO_PROJECT_INSTANCE}.syncano.link/${endpoint}/`, {
  //     method: 'POST',
  //     body: JSON.stringify(params),
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'X-Syncano-Account-Key': key
  //     }
  //   })
  // }
  //
  // const s = function (endpoint, params, key = process.env.E2E_USER_ACCOUNT_KEY_1) {
  //   return syncanoCall(endpoint, params, key)
  // }

  const generateSocket = () => {
    return {
      name: faker.helpers.slugify(faker.random.words()).toLowerCase(),
      description: 'Some description',
      version: '1.0.1',
      url: 'http://my_socket.io',
      // icon: {
      //   background: faker.internet.color(),
      //   url: 'https://cdn.rawgit.com/eyedea-io/syncano-socket-user-auth/9efd5f6a/icon.svg'
      // },
      keywords: [
        'facebook', 'social media'
      ],
      private: true,
      config: {
        'name': 'registry',
        'description': 'Main Logic of Sockets Registry',
        'classes': {
          'storage': [
            {
              'name': 'file',
              'type': 'file'
            }
          ],
          'keyword': [
            {
              'name': 'name',
              'type': 'string',
              'filter_index': true
            }
          ],
          'user': [
            {
              'name': 'display_name',
              'type': 'string'
            }, {
              'name': 'syncano_owner_id',
              'type': 'integer',
              'filter_index': true
            }
          ],
          'organization': [
            {
              'name': 'name',
              'type': 'string'
            }, {
              'name': 'members',
              'type': 'relation',
              'target': 'author',
              'filter_index': true
            }
          ],
          'socket': [
            {
              'name': 'name',
              'type': 'string',
              'filter_index': true
            }, {
              'name': 'description',
              'type': 'string',
              'filter_index': true
            }, {
              'name': 'organization',
              'type': 'reference',
              'target': 'organization',
              'filter_index': true
            }, {
              'name': 'owner_account',
              'type': 'integer',
              'filter_index': true
            }, {
              'name': 'author',
              'type': 'reference',
              'target': 'user'
            }, {
              'name': 'url',
              'type': 'string'
            }, {
              'name': 'version',
              'type': 'string',
              'order_index': true,
              'filter_index': true
            }, {
              'name': 'keywords',
              'type': 'relation',
              'target': 'keyword',
              'filter_index': true
            }, {
              'name': 'official',
              'type': 'boolean'
            }, {
              'name': 'private',
              'type': 'boolean',
              'filter_index': true
            }, {
              'name': 'config',
              'type': 'object'
            }, {
              'name': 'zip_file',
              'type': 'file'
            }
          ]
        },
        'endpoints': {
          'get': {
            'description': 'Get socket based on name and version',
            'file': 'scripts/get.js',
            'parameters': {
              'name': {
                'type': 'string',
                'description': 'Name to search for in registry',
                'example': 'facebook-bot'
              },
              'version': {
                'type': 'string',
                'description': 'Version of the socket',
                'example': '1.0.0'
              }
            },
            'response': {
              'mimetype': 'application/json',
              'examples': [
                {
                  'exit_code': 200,
                  'description': 'Successful search',
                  'example': '{\n  "name": "facebook-bot",\n  "description": "Facebook Messenger bot",\n  "version": "1.0.0",\n  "author: "Eyedea AS",\n  "url": "https://github.com/eyedea-io/facebook-bot",\n  "keywords": [\n    "facebook",\n    "social media"\n  ],\n  "official": true,\n  "private": true\n}\n'
                }
              ]
            }
          },
          'list': {
            'description': 'List last version sockets',
            'file': 'scripts/list.js',
            'response': {
              'mimetype': 'application/json',
              'examples': [
                {
                  'exit_code': 200,
                  'description': 'Successful list',
                  'example': '[\n  {\n    "name": "facebook-bot",\n    "description": "Facebook Messenger bot",\n    "version": "1.0.0",\n    "author: "Eyedea AS",\n    "url": "https://github.com/eyedea-io/facebook-bot",\n    "keywords": [\n      "facebook",\n      "social media"\n    ],\n    "official": true,\n    "private": true\n  }\n]\n'
                }
              ]
            }
          },
          'search': {
            'description': 'Search for sockets based on keyword',
            'file': 'scripts/search.js',
            'parameters': {
              'keyword': {
                'type': 'string',
                'description': 'Keyword to search for in registry',
                'example': 'facebook'
              }
            },
            'response': {
              'mimetype': 'application/json',
              'examples': [
                {
                  'exit_code': 200,
                  'description': 'Successful search',
                  'example': '[\n  {\n    "name": "facebook-bot",\n    "description": "Facebook Messenger bot",\n    "version": "1.0.0",\n    "author": "Eyedea AS",\n    "url": "https://github.com/eyedea-io/facebook-bot",\n    "keywords": [\n      "facebook",\n      "social media"\n    ],\n    "official": true\n  }\n]\n'
                }
              ]
            }
          },
          'add': {
            'description': 'Add socket to registry',
            'file': 'scripts/add.js',
            'parameters': {
              'name': {
                'type': 'string',
                'description': 'Name of the socket',
                'example': 'facebook-bot'
              },
              'description': {
                'type': 'string',
                'description': 'Description of the socket',
                'example': 'facebook-bot'
              },
              'version': {
                'type': 'string',
                'description': 'Version of the socket',
                'example': '1.0.0'
              },
              'url': {
                'type': 'string',
                'description': 'URL of the socket repository',
                'example': 'https://github.com/eyedea-io/facebook-bot'
              },
              'keywords': {
                'type': 'array',
                'description': 'Tags of the socket',
                'example': ['facebook', 'social media']
              },
              'private': {
                'type': 'boolean',
                'description': 'If true socket will be private',
                'example': true
              }
            },
            'response': {
              'mimetype': 'application/json',
              'examples': [
                {
                  'exit_code': 202,
                  'description': 'Successful registration'
                }
              ]
            }
          },
          'publish': {
            'description': 'Make private socket available in registry for everyone',
            'file': 'scripts/publish.js',
            'parameters': {
              'name': {
                'type': 'string',
                'description': 'Name of the socket',
                'example': 'facebook-bot'
              }
            },
            'response': {
              'mimetype': 'application/json',
              'examples': [
                {
                  'exit_code': 202,
                  'description': 'Successfully published'
                }
              ]
            }
          },
          'upload': {
            'description': 'Get upload link',
            'file': 'scripts/upload.js',
            'response': {
              'mimetype': 'application/json',
              'examples': [
                {
                  'exit_code': 202,
                  'description': 'Successfully published',
                  'example': '{"upload_url": "https://upload_url"}'
                }
              ]
            }
          }
        }
      }
    }
  }

  return {
    // s,
    // syncanoCall
    generateSocket
  }
}
