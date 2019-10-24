import fs from 'fs'
import faker from 'faker'
import merge from 'lodash.merge'
import path from 'path'
import YAML from 'js-yaml'
import Promise from 'bluebird'
import proxyquire from 'proxyquire'
import Validator from '@syncano/validate'


const socketFolder = process.cwd()

const runFolder = process.env.SYNCANO_TEST_RUN_DIR === undefined ? '.dist' : process.env.SYNCANO_TEST_RUN_DIR
const runExtension = process.env.SYNCANO_TEST_RUN_EXT === undefined ? 'js' : process.env.SYNCANO_TEST_RUN_EXT

const compiledScriptsFolder = path.join(socketFolder, runFolder, 'src')
const socketDefinition = YAML.load(fs.readFileSync('./socket.yml', 'utf8'))

const generateEndpointMeta = (endpointName, metaUpdate) => {
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

const generateEventHandlerMeta = (eventName, metaUpdate) => {
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

async function verifyResponse (endpoint, responseType, response) {
  const validator = new Validator({
    meta: {
      metadata: socketDefinition.endpoints[endpoint]
    }
  })

  return validator.validateResponse(responseType, response)
}

async function verifyRequest (ctx) {
  const validator = new Validator(ctx)
  return validator.validateRequest(ctx)
}

function runEventHandler (eventName, ctx = {}, params = {}, callType = 'eventHandler') {
  return run(eventName, ctx, params, callType)
}

function run (socketEndpoint, ctx = {}, params = {}, callType = 'endpoint') {
  const {args = {}, config = {}, meta = {}} = ctx
  const mocks = params.mocks

  let socketMeta
  switch (callType) {
    case 'endpoint':
      socketMeta = generateEndpointMeta(socketEndpoint, meta)
      break
    case 'eventHandler':
      socketMeta = generateEventHandlerMeta(socketEndpoint, meta)
      break
  }

  if (run.verifyRequest !== false) {
    verifyRequest({args, config, meta: socketMeta})
  }

  return new Promise((resolve, reject) => {
    const HttpResponse = function (code, data, mimetype) {
      let response = null
      if (mimetype === 'json/application') {
        response = {code, mimetype, data: JSON.parse(data)}
      } else {
        response = {code, data, mimetype}
      }
      response.is = (responseType) => {
        if (run.verifyResponse !== false) {
          return verifyResponse(socketEndpoint, responseType, response)
        }
      }
      return response
    }

    const setResponse = (response) => {
      const processedResponse = response
      if (response.mimetype === 'application/json') {
        processedResponse.data = JSON.parse(response.data)
      }
      resolve(processedResponse)
    }

    process.exitOrig = process.exit
    process.exit = () => {}

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
