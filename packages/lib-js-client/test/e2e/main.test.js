/* global describe it before after */
import path from 'path'
import {assert} from 'chai'
import {
  nixt,
  testsLocation,
  deleteInstance,
  createProject,
  uniqueInstance,
  getRandomString
} from '@syncano/test-tools'

import Syncano from '../../src/index.js'

const cliLocation = path.join(process.cwd(), '../cli/lib/cli.js')
const projectTestTemplate = path.join(
  __dirname,
  '../../../cli/tests/e2e/assets/project/empty/'
)

describe('Client', function() {
  let testInstance = uniqueInstance()
  let client = null

  const testNixt = () =>
    nixt()
      .env('SYNCANO_PROJECT_INSTANCE', testInstance)
      .env('SYNCANO_AUTH_KEY', process.env.E2E_CLI_ACCOUNT_KEY)
      .cwd(path.join(testsLocation, testInstance))

  before(() => {
    client = new Syncano(testInstance, {host: 'syncano.link'})
    assert.isFunction(client)

    return createProject(testInstance, projectTestTemplate)
  })
  after(() => deleteInstance(testInstance))

  it('can create new socket', function(done) {
    testNixt()
      .run(`${cliLocation} create hello`)
      .on(/Choose template for your Socket/)
      .respond('\n')
      .code(0)
      .end(done)
  })

  it('can deploy hello socket', function(done) {
    testNixt()
      .run(`${cliLocation} deploy hello`)
      .stdout(/socket synced:/)
      .end(done)
  })

  it('init client', () => {
    const client = new Syncano(testInstance)
    assert.isFunction(client)
  })

  it('post to endpoint without arguments', async () => {
    try {
      await client.post('hello/hello')
    } catch (err) {
      assert(
        err.response.data.message ===
          'You have to send "firstname" and "lastname" arguments!'
      )
    }
  })

  it('get to endpoint without arguments', async () => {
    try {
      await client.get('hello/hello')
    } catch (err) {
      assert(
        err.response.data.message ===
          'You have to send "firstname" and "lastname" arguments!'
      )
    }
  })

  it('post to endpoint with arguments', async () => {
    const params = {firstname: getRandomString(), lastname: getRandomString()}
    const expectedResponse = `Hello ${params.firstname} ${params.lastname}!`
    const resp = await client.post('hello/hello', params)
    assert(resp.message === expectedResponse)
  })

  it('get to endpoint with arguments', async () => {
    const params = {firstname: getRandomString(), lastname: getRandomString()}
    const expectedResponse = `Hello ${params.firstname} ${params.lastname}!`
    const resp = await client.post('hello/hello', params)
    assert(resp.message === expectedResponse)
  })
})
