/* global describe it before after */
import {
  nixt,
  testsLocation,
  cleanUpAccount,
  cliLocation,
  returnTestGlobals,
  getRandomString
} from '../utils'

const { email, password, syncanoYmlPath } = returnTestGlobals()

describe('[E2E] CLI Deploy', function () {
  before(cleanUpAccount)
  after(cleanUpAccount)

  it('can run cli command', function (done) {
    nixt()
      .run('node lib/cli.js')
      .stdout(/Usage: cli \[options\] \[command\]/)
      .end(done)
  })

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
      .stdout(/Project has been created from/)
      .match(syncanoYmlPath, /auth_key/)
      .match(syncanoYmlPath, /instance/)
      .end(done)
  })

  // This tests are just checking for proper console output currently
  // and depend on the init from previous test.
  // We should improve it in the future.
  it('can list installed sockets', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} list`)
      .stdout(/description: Hello World Socket/)
      .end(done)
  })

  it('can\'t list non existing Socket', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} list ${getRandomString()}`)
      .stdout(/No Socket was found on server nor in config!/)
      .end(done)
  })

  it('can deploy hello socket', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} deploy hello`)
      .stdout(/socket synced:/)
      .end(done)
  })

  it('can call hello socket endpoint', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} call hello/hello`)
      .on(/Type in value for "firstname" parameter/)
      .respond('TEST\n')
      .on(/Type in value for "lastname" parameter/)
      .respond('CLI\n')
      .code(0)
      .stdout(/Hello TEST CLI/)
      .end(done)
  })
})
