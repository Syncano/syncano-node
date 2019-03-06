/* eslint import/no-extraneous-dependencies: "warn" */
import faker from 'faker'
import mkdirp from 'mkdirp'
import fs from 'fs-extra'
import path from 'path'
import Syncano from '@syncano/core'
import origNixt from 'nixt'
import _ from 'lodash'

import uniqueInstance from './unique-instance'

import homeDir from 'home-dir'

const returnTestGlobals = () => {
  return {
    email: process.env.E2E_CLI_EMAIL,
    apiHost: process.env.E2E_SYNCANO_HOST,
    password: process.env.E2E_CLI_PASSWORD,
    accountKey: process.env.E2E_CLI_ACCOUNT_KEY,
    syncanoYmlPath: `${homeDir()}/syncano-test.yml`,
    instance: process.env.E2E_CLI_INSTANCE_NAME
  }
}

const splitTestBaseEmail = (tempEmail) => {
  const splittedEmail = {};

  [splittedEmail.emailName, splittedEmail.emailDomain] = tempEmail.split('@')

  return splittedEmail
}

const createTempEmail = (tempEmail, tempPass) => {
  const { emailName, emailDomain } = splitTestBaseEmail(tempEmail)
  return `${emailName}+${tempPass}@${emailDomain}`
}

const getRandomString = (prefix = 'randomstring') => {
  return `${prefix}_${Math.random().toString(36).slice(2)}`
}

const assignTestRegistryEnv = () => {
  const registryInstanceName = process.env.SYNCANO_SOCKET_REGISTRY
  process.env.SYNCANO_SOCKET_REGISTRY_INSTANCE = registryInstanceName.split('.')[0]
}

const removeTestRegistryEnv = () => {
  delete process.env.SYNCANO_SOCKET_REGISTRY_INSTANCE
}

if (process.env.SYNCANO_E2E_DEBUG) {
  origNixt.prototype.expect = function (fn) {
    function wrappedExpect (result) {
      console.log(' '.repeat(6), 'stdout:')
      console.log(' '.repeat(8), result.stdout)
      console.log(' '.repeat(6), 'code:')
      console.log(' '.repeat(8), result.code.toString())
      return fn(result)
    }
    this.expectations.push(wrappedExpect)
  }
}
const nixt = origNixt

// Variables used in tests
process.env.SYNCANO_ACCOUNT_FILE = 'syncano-test'
const { syncanoYmlPath, instance } = returnTestGlobals()

const testsLocation = `${process.cwd()}/e2e-tests`
const cliLocation = path.join(process.cwd(), '/node_modules/@syncano/cli/lib/cli.js')
const randomKey = getRandomString()
const createdSocketName = getRandomString()

const setupLocation = (name) => {
  const location = [testsLocation, name].join('-')
  if (!fs.existsSync(location)) {
    mkdirp.sync(location)
  }
  return location
}

const shutdownLocation = (location) => {
  if (fs.existsSync(location)) {
    fs.removeSync(location)
  }
  fs.removeSync(syncanoYmlPath)
}

const createConnection = () => {
  const {accountKey, apiHost} = returnTestGlobals()
  return new Syncano({accountKey, meta: {api_host: apiHost}})
}

// Helper functions used in tests
const createInstance = (instanceName) =>
  createConnection().instance.create({ name: instanceName || uniqueInstance() })

  const createBackup = () => createConnection().backup.create()

  const deleteInstance = (instanceName) => createConnection().instance.delete(instanceName)

  const deleteEachInstance = (instances) => {
    const list = []

    _.each(instances, (item) => list.push(deleteInstance(item)))
    return Promise.all(list)
  }

const cleanUpAccount = () =>
  createConnection().instance
    .list()
    .then(res => {
      const instances = _.pull(_.map(res, 'name'), instance)
      return deleteEachInstance(instances)
    })

const createProject = (instanceName, projectTestTemplate) => {
  fs.copySync(projectTestTemplate, path.join(testsLocation, instanceName))
  return createInstance(instanceName)
}

const generateResponse = (response) => {
  return Object.assign({
    code: 200,
    data: {},
    mimetype: 'application/json'
  }, response)
}

const generateContext = () => {
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
        description: 'Search for data based on given postcode',
        inputs: {
          type: 'object',
          properties: {
            postcode: {
              type: 'integer',
              description: 'Post code',
              example: 113
            }
          }
        },
        outputs: {
          success: {
            description: 'Successful query',
            properties: {
              city: {
                typeOf: 'string'
              },
              municipality: {
                type: 'string'
              },
              county: {
                'type': 'string'
              },
              category: {
                type: 'string'
              }
            }
          },
          notFound: {
            description: 'Post code not found',
            exit_code: 404,
            properties: {
              message: {
                type: 'string'
              }
            }
          },
          fail: {
            description: 'Zip generation failed',
            exit_code: 400,
            parameters: {
              message: {
                type: 'string'
              }
            }
          }
        }
      }
    }
  }
}

export {
  createConnection,
  testsLocation,
  returnTestGlobals,
  getRandomString,
  splitTestBaseEmail,
  createTempEmail,
  assignTestRegistryEnv,
  removeTestRegistryEnv,
  nixt,
  cliLocation,
  randomKey,
  createdSocketName,
  setupLocation,
  shutdownLocation,
  createProject,
  createInstance,
  deleteInstance,
  uniqueInstance,
  createBackup,
  cleanUpAccount,
  generateContext,
  generateResponse
}
