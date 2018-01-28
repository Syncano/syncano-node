/* eslint import/no-extraneous-dependencies: "warn" */
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
    password: process.env.E2E_CLI_PASSWORD,
    accountKey: process.env.E2E_CLI_ACCOUNT_KEY,
    syncanoYmlPath: `${homeDir()}/syncano-test.yml`,
    instance: process.env.E2E_CLI_INSTANCE_NAME || 'wandering-pine-7032'
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

const getRandomString = (prefix = 'randomString') => {
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

process.env.SYNCANO_ACCOUNT_FILE = 'syncano-test'

// Variables used in tests
const { accountKey, syncanoYmlPath, instance } = returnTestGlobals()

// const connection = Syncano({ baseUrl: `https://${process.env.SYNCANO_HOST}`, accountKey })
const connection = new Syncano({accountKey, meta: { 'api_host': process.env.SYNCANO_HOST }})
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

// Helper functions used in tests
const createInstance = (instanceName) => connection.instance
    .create({ name: instanceName || uniqueInstance() })
    .catch((error) => process.stderr.write(JSON.stringify(error.message, null, '')))

const deleteInstance = (instanceName) => connection.instance
    .delete(instanceName)
    .catch((error) => process.stderr.write(
      JSON.stringify(`deleteInstance: ${error.message}`, null, '')
    ))

const deleteEachInstance = (instances) => {
  const list = []

  _.each(instances, (item) => list.push(deleteInstance(item)))
  return Promise.all(list)
}

const cleanUpAccount = () => connection.instance
    .list()
    .then(res => {
      const instances = _.pull(_.map(res, 'name'), instance)
      return deleteEachInstance(instances)
    })
    .catch((error) => process.stderr.write(JSON.stringify(error.message)))

const createProject = (instanceName, projectTestTemplate) => {
  fs.copySync(projectTestTemplate, path.join(testsLocation, instanceName))
  return createInstance(instanceName)
}

export {
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
  cleanUpAccount
}
