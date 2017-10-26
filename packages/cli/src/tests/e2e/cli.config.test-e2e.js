import fs from 'fs-extra'

import utils from '../../utils/test-utils'
import {
  nixt,
  testsLocation,
  cleanUpAccount,
  cliLocation
} from '../utils'

const configTestTemplate = `${process.cwd()}/src/tests/e2e/assets/sockets/hello-config`
const { email, password, syncanoYmlPath } = utils.returnTestGlobals()

const moveTestSocket = (template) => {
  try {
    fs.copySync(template, `${testsLocation}/syncano/`)
  } catch (err) {
    console.error('moveTestSocket', err)
  }
}

describe('[E2E] CLI Config', function () {
  before(cleanUpAccount)
  after(cleanUpAccount)

  it('can run cli init with existing account', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} init`)
      .on(/Your e-mail/)
      .respond(`${email}\n`)
      .on(/Password/)
      .respond(`${password}\n`)
      .on(/Hello World template/)
      // Choose from dropdown default project template: hello
      .respond('\n')
      .stdout(/Creating Syncano Instance/)
      .stdout(/Project has been created from hello template/)
      .match(syncanoYmlPath, /auth_key/)
      .match(syncanoYmlPath, /instance/)
      .end(done)
  })

  it('can sync test config socket', function (done) {
    nixt()
      .cwd(testsLocation)
      .before(function () {
        return moveTestSocket(configTestTemplate)
      })
      .run(`${cliLocation} deploy hello-config`)
      .stdout(/socket synced:/)
      .end(done)
  })

  it('can set first config option', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} config-set hello-config TEST1 test1_value`)
      .end(done)
  })

  it('can set second config option', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} config-set hello-config TEST2 test2_value`)
      .end(done)
  })

  it('can show config of the socket', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} config-show hello-config`)
      .stdout(/value: test2_value/)
      .end(done)
  })

  it('can change first config option of the socket', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} config-set hello-config TEST1 test1_value_new`)
      .end(done)
  })

  it('can see new config option of the socket', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} config-show hello-config`)
      .stdout(/value: test1_value_new/)
      .end(done)
  })

  it('can configure the socket fully', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} config hello-config`)
      .on(/TEST1/)
      .respond('test1\n')
      .on(/TEST2/)
      .respond('test2\n')
      .on(/TEST3/)
      .respond('test2\n')
      .end(done)
  })

  it('can logout from cli', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} logout`)
      .stdout(/You have been logged out/)
      .unlink(syncanoYmlPath)
      .end(done)
  })
})
