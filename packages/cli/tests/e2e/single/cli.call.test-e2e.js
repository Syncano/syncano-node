/* global describe it before after */
import {
  nixt,
  testsLocation,
  cleanUpAccount,
  cliLocation,
  returnTestGlobals
} from '../../utils'

const { email, password, syncanoYmlPath } = returnTestGlobals()

describe('CLI Commands - Call', function () {
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
      .stdout(/Project has been created from/)
      .match(syncanoYmlPath, /auth_key/)
      .match(syncanoYmlPath, /instance/)
      .end(done)
  })

  it('can deploy hello socket', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} deploy hello`)
      .stdout(/socket synced:/)
      .end(done)
  })

  it('can call hello socket with default arguments', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} call hello/hello`)
      .on(/"firstname" parameter/)
      .respond(`\n`)
      .on(/"lastname" parameter/)
      .respond(`\n`)
      .stdout(/Hello Tyler Durden!/)
      .end(done)
  })
})
