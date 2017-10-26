/* eslint import/no-extraneous-dependencies: "warn" */
import mkdirp from 'mkdirp'
import fs from 'fs-extra'
import Syncano from 'syncano'
import origNixt from 'nixt'
import Promise from 'bluebird'
import _ from 'lodash'

import utils from '../utils/test-utils'
import { p } from '../utils/print-tools'
import uniqueInstance from '../utils/unique-instance'

if (process.env.SYNCANO_E2E_DEBUG) {
  origNixt.prototype.expect = function (fn) {
    function wrappedExpect (result) {
      console.log(p(6)('stdout:'))
      console.log(p(8)(result.stdout))
      console.log(p(6)('code:'))
      console.log(p(8)(result.code.toString()))
      return fn(result)
    }
    this.expectations.push(wrappedExpect)
  }
}
export const nixt = origNixt

process.env.SYNCANO_ACCOUNT_FILE = 'syncano-test'

// Variables used in tests
const { accountKey, syncanoYmlPath, instance } = utils.returnTestGlobals()

export const connection = Syncano({ baseUrl: `https://${process.env.SYNCANO_HOST}`, accountKey })
export const testsLocation = `${process.cwd()}/e2e-tests`
export const cliLocation = 'node ../lib/cli.js'
export const randomKey = utils.getRandomString()
export const createdSocketName = utils.getRandomString()

export const setupLocation = (name) => {
  const location = [testsLocation, name].join('-')
  if (!fs.existsSync(location)) {
    mkdirp.sync(location)
  }
  return location
}

export const shutdownLocation = (location) => {
  if (fs.existsSync(location)) {
    fs.removeSync(location)
  }
  fs.removeSync(syncanoYmlPath)
}

// Helper functions used in tests
export const createInstance = () => connection.Instance
    .please()
    .create({ name: uniqueInstance() })
    .then((response) => response)
    .catch((error) => process.stderr.write(JSON.stringify(error.message, null, '')))

export const deleteInstance = (item) => connection.Instance
    .please()
    .delete({ name: item })
    .then((response) => response)
    .catch((error) => process.stderr.write(JSON.stringify(error.message, null, '')))

export const deleteEachInstance = (instances) => {
  const list = []

  _.each(instances, (item) => list.push(deleteInstance(item)))
  return Promise.all(list)
}

export const cleanUpAccount = () => connection.Instance
    .please()
    .list()
    .then((res) => {
      const instances = _.pull(_.map(res, 'name'), instance)
      return deleteEachInstance(instances)
    })
    .catch((error) => process.stderr.write(JSON.stringify(error.message)))
