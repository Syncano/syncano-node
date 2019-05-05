/* global describe it beforeAll afterAll */
import path from 'path'
import fs from 'fs-extra'

import {
  nixt,
  testsLocation,
  deleteInstance,
  createProject,
  uniqueInstance
} from '@syncano/test-tools'

import {cliLocation, projectTestTemplate, configTestTemplate} from '../utils'

describe('CLI Config', function () {
  let testInstance = uniqueInstance()

  const moveTestSocket = (template) => {
    fs.copySync(template, path.join(testsLocation, testInstance, 'syncano', 'hello-config'))
  }

  const testNixt = () => nixt()
    .env('SYNCANO_PROJECT_INSTANCE', testInstance)
    .env('SYNCANO_AUTH_KEY', process.env.E2E_CLI_ACCOUNT_KEY)
    .cwd(path.join(testsLocation, testInstance))

  beforeAll(async () => createProject(testInstance, projectTestTemplate))
  afterAll(async () => deleteInstance(testInstance))

  it('can sync test config socket', function (done) {
    testNixt()
      .before(function () {
        return moveTestSocket(configTestTemplate)
      })
      .run(`${cliLocation} socket:deploy hello-config`)
      .stdout(/total time:/)
      .code(0)
      .end(done)
  })

  it('can set first config option', function (done) {
    testNixt()
      .run(`${cliLocation} socket:config:set hello-config TEST1 test1_value`)
      .stdout(/Config updated!/)
      // .code(0)
      .end(done)
  })

  it('can set second config option', function (done) {
    testNixt()
      .run(`${cliLocation} socket:config:set hello-config TEST2 test2_value`)
      .stdout(/Config updated!/)
      .code(0)
      .end(done)
  })

  it('can show config of the socket', function (done) {
    testNixt()
      .run(`${cliLocation} socket:config:show hello-config`)
      .stdout(/value: test2_value/)
      .code(0)
      .end(done)
  })

  it('can change first config option of the socket', function (done) {
    testNixt()
      .run(`${cliLocation} socket:config:set hello-config TEST1 test1_value_new`)
      .stdout(/Config updated!/)
      .code(0)
      .end(done)
  })

  it('can see new config option of the socket', function (done) {
    testNixt()
      .run(`${cliLocation} socket:config:show hello-config`)
      .stdout(/value: test1_value_new/)
      .code(0)
      .end(done)
  })

  it('can configure the socket fully', function (done) {
    testNixt()
      .run(`${cliLocation} socket:config hello-config`)
      .on(/TEST1/)
      .respond('test1\n')
      .on(/TEST2/)
      .respond('test2\n')
      .on(/TEST3/)
      .respond('test2\n')
      .stdout(/Config updated!/)
      .code(0)
      .end(done)
  })

  it('can call hello-config socket endpoint', function (done) {
    testNixt()
      .run(`${cliLocation} socket:call hello-config/hello`)
      .stdout(/test1 test2/)
      .code(0)
      .end(done)
  })
})
