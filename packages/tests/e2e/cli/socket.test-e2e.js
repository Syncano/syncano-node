/* global describe it beforeAll afterAll */
import path from 'path'
import {
  nixt,
  testsLocation,
  deleteInstance,
  createProject,
  uniqueInstance,
  getRandomString,
  createdSocketName
} from '@syncano/test-tools'

import {cliLocation, projectTestTemplate} from '../utils'

describe('CLI Socket', function () {
  let testInstance = uniqueInstance()

  const testNixt = () => nixt()
    .env('SYNCANO_PROJECT_INSTANCE', testInstance)
    .env('SYNCANO_AUTH_KEY', process.env.E2E_CLI_ACCOUNT_KEY)
    .cwd(path.join(testsLocation, testInstance))

  beforeAll(async () => createProject(testInstance, projectTestTemplate))
  afterAll(async () => deleteInstance(testInstance))

  it('can create new socket', function (done) {
    testNixt()
      .run(`${cliLocation} create hello`)
      .on(/Choose template for your Socket/)
      .respond('\n')
      .code(0)
      .end(done)
  })

  it('can list installed sockets', function (done) {
    testNixt()
      .run(`${cliLocation} list`)
      .stdout(/Description of hello/)
      .code(0)
      .end(done)
  })

  it('can list single installed socket with docs', function (done) {
    testNixt()
      .run(`${cliLocation} list hello`)
      .stdout(/endpoint:/)
      .code(0)
      .end(done)
  })

  it('can\'t list non existing Socket', function (done) {
    testNixt()
      .run(`${cliLocation} list ${getRandomString()}`)
      .stdout(/No Socket was found on server nor in config!/)
      .code(1)
      .end(done)
  })

  it('can deploy hello socket', function (done) {
    testNixt()
      .run(`${cliLocation} deploy hello`)
      .stdout(/socket synced:/)
      .code(0)
      .end(done)
  })

  it('can set config of socket', function (done) {
    testNixt()
      .run(`${cliLocation} config-set hello name test`)
      .code(0)
      .end(done)
  })

  it('can create new socket', function (done) {
    testNixt()
      .run(`${cliLocation} create ${createdSocketName}`)
      .on(/Choose template for your Socket/)
      .respond('\n')
      .code(0)
      .end(done)
  })

  it('can\'t create new socket with the name of existing socket', function (done) {
    testNixt()
      .run(`${cliLocation} create ${createdSocketName}`)
      .on(/Choose template for your Socket/)
      .respond('\n')
      .stdout(/Socket with given name already exist!/)
      .code(1)
      .end(done)
  })
})
