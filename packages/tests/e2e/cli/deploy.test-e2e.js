/* global describe it beforeAll afterAll */
import fs from 'fs-extra'
import path from 'path'
import {
  nixt,
  testsLocation,
  deleteInstance,
  createProject,
  createInstance,
  uniqueInstance,
  getRandomString
} from '@syncano/test-tools'

import {cliLocation, projectTestTemplate} from '../utils'

describe('CLI Deploy', function () {
  let testInstance = uniqueInstance()

  const testNixt = () => nixt()
    .env('SYNCANO_PROJECT_INSTANCE', testInstance)
    .env('SYNCANO_AUTH_KEY', process.env.E2E_CLI_ACCOUNT_KEY)
    .cwd(path.join(testsLocation, testInstance))

  beforeAll(async () => createProject(testInstance, projectTestTemplate))
  afterAll(async () => deleteInstance(testInstance))

  it('can list installed sockets', function (done) {
    testNixt()
      .run(`${cliLocation} socket:list`)
      .stdout(/No Socket was found on server nor in config!/)
      .code(0)
      .end(done)
  })

  it('can\'t list non existing Socket', function (done) {
    testNixt()
      .run(`${cliLocation} socket:list ${getRandomString()}`)
      .stdout(/No Socket was found on server nor in config!/)
      .code(1)
      .end(done)
  })

  it('can create new socket', function (done) {
    testNixt()
      .run(`${cliLocation} socket:create hello`)
      .on(/Choose template for your Socket/)
      .respond('\n')
      .code(0)
      .end(done)
  })

  it('can deploy hello socket', function (done) {
    testNixt()
      .run(`${cliLocation} socket:deploy hello`)
      .stdout(/socket synced:/)
      .code(0)
      .end(done)
  })

  it('can call hello socket endpoint', function (done) {
    testNixt()
      .run(`${cliLocation} socket:call hello/hello`)
      .on(/Type in value for "firstname" parameter/)
      .respond('TEST\n')
      .on(/Type in value for "lastname" parameter/)
      .respond('CLI\n')
      .stdout(/Hello TEST CLI/)
      .code(0)
      .end(done)
  })

  it('can deploy with instance creation', function (done) {
    let testInstance = uniqueInstance()

    const moveTestProject = (template) => {
      fs.copySync(template, path.join(testsLocation, testInstance))
    }

    const testNixt = () => nixt()
      .env('SYNCANO_AUTH_KEY', process.env.E2E_CLI_ACCOUNT_KEY)
      .cwd(path.join(testsLocation, testInstance))

    testNixt()
      .before(() => moveTestProject(projectTestTemplate))
      .after(() => deleteInstance(testInstance))
      .run(`${cliLocation} socket:deploy --create-instance ${testInstance}`)
      .stdout(/has been created/)
      .code(0)
      .end(done)
  })

  it('can\'t deploy with instance creation if instance already exist', function (done) {
    let testInstance = uniqueInstance()

    const moveTestProject = (template) => {
      fs.copySync(template, path.join(testsLocation, testInstance))
    }

    const testNixt = () => nixt()
      .env('SYNCANO_AUTH_KEY', process.env.E2E_CLI_ACCOUNT_KEY)
      .cwd(path.join(testsLocation, testInstance))

    testNixt()
      .before(async () => {
        await moveTestProject(projectTestTemplate)
        await createInstance(testInstance)
      })
      .after(() => deleteInstance(testInstance))
      .run(`${cliLocation} socket:deploy --create-instance ${testInstance}`)
      .stdout(/Instance already exist!/)
      .code(1)
      .end(done)
  })
})
