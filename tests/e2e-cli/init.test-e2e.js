/* global describe it before after */
import path from 'path'

import {
  nixt,
  testsLocation,
  cleanUpAccount,
  returnTestGlobals,
  createTempEmail
} from '@syncano/test-tools'

import uniqueInstance from '../../src/utils/unique-instance'

const cliLocation = path.join(process.cwd(), 'lib/cli.js')
const { email, password, syncanoYmlPath, instance } = returnTestGlobals()
const tempPass = Date.now()
const tempEmail = createTempEmail(process.env.E2E_CLI_TEMP_EMAIL, tempPass)

describe('[E2E] CLI User', function () {
  before(cleanUpAccount)
  after(cleanUpAccount)

  const testNixt = () => nixt()
    .cwd(path.join(testsLocation))

  it('can run cli command', function (done) {
    testNixt()
      .run('node lib/cli.js')
      .stdout(/Usage: cli \[options\] \[command\]/)
      .end(done)
  })

  it('can run cli init with existing account', function (done) {
    testNixt()
      .run(`${cliLocation} init`)
      .on(/Your e-mail/)
      .respond(`${email}\n`)
      .on(/Password/)
      .respond(`${password}\n`)
      .on(/Hello World/)
      // Choose from dropdown default project template: hello
      .respond('\n')
      .stdout(/Creating Syncano Instance/)
      .stdout(/Project has been created from/)
      .match(syncanoYmlPath, /auth_key/)
      .match(syncanoYmlPath, /instance/)
      .end(done)
  })

  it('can logout from cli', function (done) {
    testNixt()
      .cwd(testsLocation)
      .run(`${cliLocation} logout`)
      .stdout(/You have been logged out/)
      .unlink(syncanoYmlPath)
      .end(done)
  })
  // This is end of tests dependency

  it('can run cli init --instance with existing account', function (done) {
    testNixt()
      .cwd(testsLocation)
      .run(`${cliLocation} init --instance ${instance}`)
      .on(/Your e-mail/)
      .respond(`${email}\n`)
      .on(/Password/)
      .respond(`${password}\n`)
      .on(/Choose template for your project/)
      .respond('\n')
      .stdout(/Project has been created from/)
      .match(syncanoYmlPath, /auth_key/)
      .match(syncanoYmlPath, /instance/)
      .unlink(syncanoYmlPath)
      .end(done)
  })

  it('can run cli init with new account', function (done) {
    testNixt()
      .run(`${cliLocation} init`)
      .on(/Your e-mail/)
      .respond(`${tempEmail}\n`)
      .on(/Password/)
      .respond(`${tempPass}\n`)
      .on(/This email doesn't exists/)
      .respond('Yes\n')
      .stdout(/New account has been created/)
      .on(/Choose template for your project/)
      .respond('\n')
      .stdout(/Creating Syncano Instance/)
      .stdout(/Project has been created from/)
      .match(syncanoYmlPath, /auth_key/)
      .match(syncanoYmlPath, /instance/)
      .unlink(syncanoYmlPath)
      .end(done)
  })

  // For now we don't support create new instance on Syncano with specific name during init project.
  // Unlock this test in CLI-208
  it.skip('can run cli init --instance with new account', function (done) {
    testNixt()
      .run(`${cliLocation} init --instance ${uniqueInstance()}`)
      .on(/Your e-mail/)
      .respond(`${tempEmail}\n`)
      .on(/Password/)
      .respond(`${tempPass}\n`)
      .on(/Choose template for your project/)
      .respond('\n')
      .stdout(/Project has been created from/)
      .match(syncanoYmlPath, /auth_key/)
      .match(syncanoYmlPath, /instance/)
      .unlink(syncanoYmlPath)
      .end(done)
  })
})
