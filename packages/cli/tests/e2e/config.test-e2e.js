/* global describe it before after */
import path from 'path'
import fs from 'fs-extra'

import {
  nixt,
  testsLocation,
  deleteInstance,
  createProject,
  uniqueInstance
} from '@syncano/test-tools'

const cliLocation = path.join(process.cwd(), 'lib/cli.js')
const configTestTemplate = path.join(__dirname, './assets/sockets/hello-config')
const projectTestTemplate = path.join(__dirname, './assets/project/empty/')

describe('[E2E] CLI Config', function () {
  let testInstance = uniqueInstance()

  const moveTestSocket = (template) => {
    fs.copySync(template, path.join(testsLocation, testInstance, 'syncano', 'hello-config'))
  }

  const testNixt = () => nixt()
    .env('SYNCANO_PROJECT_INSTANCE', testInstance)
    .env('SYNCANO_AUTH_KEY', process.env.E2E_CLI_ACCOUNT_KEY)
    .cwd(path.join(testsLocation, testInstance))

  before(async () => createProject(testInstance, projectTestTemplate))
  after(async () => deleteInstance(testInstance))

  it('can sync test config socket', function (done) {
    testNixt()
      .before(function () {
        return moveTestSocket(configTestTemplate)
      })
      .run(`${cliLocation} deploy hello-config`)
      .stdout(/socket synced:/)
      .end(done)
  })

  it('can set first config option', function (done) {
    testNixt()
      .run(`${cliLocation} config-set hello-config TEST1 test1_value`)
      .end(done)
  })

  it('can set second config option', function (done) {
    testNixt()
      .run(`${cliLocation} config-set hello-config TEST2 test2_value`)
      .end(done)
  })

  it('can show config of the socket', function (done) {
    testNixt()
      .run(`${cliLocation} config-show hello-config`)
      .stdout(/value: test2_value/)
      .end(done)
  })

  it('can change first config option of the socket', function (done) {
    testNixt()
      .run(`${cliLocation} config-set hello-config TEST1 test1_value_new`)
      .end(done)
  })

  it('can see new config option of the socket', function (done) {
    testNixt()
      .run(`${cliLocation} config-show hello-config`)
      .stdout(/value: test1_value_new/)
      .end(done)
  })

  it('can configure the socket fully', function (done) {
    testNixt()
      .run(`${cliLocation} config hello-config`)
      .on(/TEST1/)
      .respond('test1\n')
      .on(/TEST2/)
      .respond('test2\n')
      .on(/TEST3/)
      .respond('test2\n')
      .end(done)
  })

  it('can call hello-config socket endpoint', function (done) {
    testNixt()
      .run(`${cliLocation} call hello-config/hello`)
      .stdout(/test1 test2/)
      .end(done)
  })
})
