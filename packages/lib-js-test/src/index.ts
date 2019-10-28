import fs from 'fs'
import faker from 'faker'
import merge from 'lodash.merge'
import path from 'path'
import YAML from 'js-yaml'
import Bluebird from 'bluebird'
import proxyquire from 'proxyquire'
import Validator from '@syncano/validate'

const socketFolder = process.cwd()

const runFolder = process.env.SYNCANO_TEST_RUN_DIR || '.dist/src'
const runExtension = process.env.SYNCANO_TEST_RUN_EXT || 'js'

const compiledScriptsFolder = path.join(socketFolder, runFolder)
const socketDefinition = YAML.load(fs.readFileSync('./socket.yml', 'utf8'))

const generateEndpointMeta = (endpointName: string, metaUpdate: any) => {
  const socketName = socketDefinition.name

  const apiHost = process.env.SYNCANO_HOST
  const token = process.env.SYNCANO_AUTH_KEY
  const instance = process.env.SYNCANO_INSTANCE_NAME || process.env.SYNCANO_PROJECT_INSTANCE

  let meta = {
    socket: socketName,
    api_host: apiHost,
    token,
    instance,
    debug: process.env.DEBUG || false,
    executor: `${socketName}/${endpointName}`,
    executed_by: 'socket_endpoint',
    request: {
      REQUEST_METHOD: 'POST',
      PATH_INFO: '/v2/instances/withered-voice-2245/endpoints/sockets/norwegian-postcode/search/',
      HTTP_USER_AGENT: faker.internet.userAgent(),
      HTTP_CONNECTION: 'close',
      REMOTE_ADDR: faker.internet.ip(),
      HTTP_HOST: apiHost,
      HTTP_UPGRADE_INSECURE_REQUESTS: '1',
      HTTP_ACCEPT: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      HTTP_ACCEPT_LANGUAGE: 'en,en-US;q=0.8,pl;q=0.6',
      HTTP_ACCEPT_ENCODING: 'gzip, deflate, br'
    },
    metadata: socketDefinition.endpoints[endpointName]
  }
  if (metaUpdate) {
    meta = merge(meta, metaUpdate)
  }
  return meta
}

// TODO: Add typings
const generateEventHandlerMeta = (eventName: string, metaUpdate: any) => {
  const socketName = socketDefinition.name

  const apiHost = process.env.SYNCANO_HOST
  const token = process.env.SYNCANO_AUTH_KEY
  const instance = process.env.SYNCANO_INSTANCE_NAME || process.env.SYNCANO_PROJECT_INSTANCE

  let meta = {
    socket: socketName,
    api_host: apiHost,
    token,
    instance,
    debug: process.env.DEBUG || false,
    // executor: `${socketName}/${eventName}`,
    executed_by: 'socket_endpoint',
    metadata: socketDefinition.event_handlers[`events.${eventName}`]
  }

  if (metaUpdate) {
    meta = merge(meta, metaUpdate)
  }
  return meta
}

// TODO: Add typings
async function verifyResponse (endpoint: string, responseType: string, response: any) {
  const validator = new Validator({
    meta: {
      metadata: socketDefinition.endpoints[endpoint]
    }
  })

  return validator.validateResponse(responseType, response)
}

// TODO: Add typings
async function verifyRequest (ctx: any) {
  const validator = new Validator(ctx)
  return validator.validateRequest(ctx)
}

function runEventHandler (eventName: string, ctx = {}, params = {}, callType: 'endpoint' | 'eventHandler' = 'eventHandler') {
  return run(eventName, ctx, params, callType)
}

// TODO: Add typings
function run (
  socketEndpoint: string,
  ctx: any = {},
  params: {
    mocks?: any
    [key: string]: any
  } = {},
  callType: 'endpoint' | 'eventHandler' = 'endpoint'
) {
  const {args = {}, config = {}, meta = {}} = ctx
  const mocks = params.mocks

  // TODO: Add typings
  let socketMeta: any
  switch (callType) {
    case 'endpoint':
      socketMeta = generateEndpointMeta(socketEndpoint, meta)
      break
    case 'eventHandler':
      socketMeta = generateEventHandlerMeta(socketEndpoint, meta)
      break
  }

  // TODO: Add typings
  if ((run as any).verifyRequest !== false) {
    verifyRequest({args, config, meta: socketMeta})
  }

  return new Bluebird((resolve, reject) => {
    // TODO: Add typings
    const HttpResponse = function (code: number, data:any, mimetype: string) {
      // TODO: Add typings
      let response: any = null
      if (mimetype === 'json/application') {
        response = {code, mimetype, data: JSON.parse(data)}
      } else {
        response = {code, data, mimetype}
      }
      // TODO: Add typings
      response.is = (responseType: any) => {
        // TODO: Add typings
        if ((run as any).verifyResponse !== false) {
          return verifyResponse(socketEndpoint, responseType, response)
        }
        return response
      }
      return response
    }

    // TODO: Add typings
    const setResponse = (response: any) => {
      const processedResponse = response
      if (response.mimetype === 'application/json') {
        processedResponse.data = JSON.parse(response.data)
      }
      resolve(processedResponse)
    }

    (process as any).exitOrig = process.exit
    process.exit = (() => {}) as any

    module.filename = `${compiledScriptsFolder}/${socketEndpoint}.${runExtension}`

    try {
      let runFunc
      if (mocks) {
        runFunc = proxyquire(path.join(compiledScriptsFolder, `${socketEndpoint}.${runExtension}`), mocks).default
      } else {
        runFunc = require(path.join(compiledScriptsFolder, `${socketEndpoint}.${runExtension}`)).default
      }
      runFunc({args, config, meta: socketMeta, HttpResponse, setResponse})
    } catch (err) {
      reject(err)
    }
  })
}

export {
  run,
  runEventHandler,
  generateEndpointMeta
}
