/* global describe it before after */
import path from 'path'
import tools from '@syncano/test-tools'

const { nixt, testsLocation, cleanUpAccount, createdSocketName, returnTestGlobals } = tools
const cliLocation = path.join(process.cwd(), '/node_modules/@syncano/cli/lib/cli.js')
const { email, password, syncanoYmlPath } = returnTestGlobals()

describe('[E2E] Template ES6', function () {
  before(async () => {
    // await tools.createInstance()
  })
  after(cleanUpAccount)

  it('can run cli init with existing account', function (done) {
    nixt()
      .cwd(testsLocation)
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

  it('can create new socket', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} create ${createdSocketName}`)
      .on(/Choose template for your Socket/)
      .respond('\n')
      .stdout(/Your Socket configuration is stored at/)
      .end(done)
  })
})
