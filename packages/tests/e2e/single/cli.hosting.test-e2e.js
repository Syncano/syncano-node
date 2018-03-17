/* global describe it before after */
import {
  nixt,
  testsLocation,
  cleanUpAccount,
  cliLocation,
  returnTestGlobals
} from '../../utils'

const hostingName = 'tests'
const hostingName2 = 'tests2'
const { email, password, syncanoYmlPath } = returnTestGlobals()

describe('CLI Commands - Hosting', function () {
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

  it('can add hosting', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} hosting add hosting`)
      .on(/Set hosting's name/)
      .respond(`${hostingName}\n`)
      .on(/Set CNAME/)
      .respond('\n')
      .on(/sync files now/)
      .respond('\n')
      .stdout(/sync files use: syncano-cli hosting sync/)
      .end(done)
  })

  it('can add hosting with folder outside of syncano folder', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} hosting add ../tests/e2e/assets/hosting_test`)
      .on(/Set hosting's name/)
      .respond(`${hostingName2}\n`)
      .on(/Set CNAME/)
      .respond('\n')
      .on(/sync files now/)
      .respond('\n')
      .stdout(/sync files use: syncano-cli hosting sync/)
      .end(done)
  })

  it('can list hosting containers', function (done) {
    nixt()
    .cwd(testsLocation)
    .run(`${cliLocation} hosting list`)
    .on(/Choose socket for which you you want to list hostings/)
    .respond('\n')
    .stdout(/name: tests/)
    .end(done)
  })

  it('can check if there are hosting files', function (done) {
    nixt()
    .cwd(testsLocation)
    .run(`${cliLocation} hosting files ${hostingName}`)
    .on(/Choose a socket which hosting files you want to see/)
    .respond('\n')
    .stdout(/There are no files in this hosting/)
    .end(done)
  })

  it('can sync local hosting', function (done) {
    nixt()
    .cwd(testsLocation)
    .run(`${cliLocation} hosting sync ${hostingName}`)
    .on(/Choose socket in which you want to set up hosting/)
    .respond('\n')
    .stdout(/files synchronized/)
    .end(done)
  })

  it('can delete hosting container 1', function (done) {
    nixt()
    .cwd(testsLocation)
    .run(`${cliLocation} hosting delete ${hostingName}`)
    .on(/Are you sure you/)
    .respond('Y\n')
    .stdout(/has been successfully deleted!/)
    .end(done)
  })

  it('can delete hosting container 2', function (done) {
    nixt()
    .cwd(testsLocation)
    .run(`${cliLocation} hosting delete ${hostingName2}`)
    .on(/Are you sure you/)
    .respond('Y\n')
    .stdout(/has been successfully deleted!/)
    .end(done)
  })

  it('can see there is not hosting containers', function (done) {
    nixt()
    .cwd(testsLocation)
    .run(`${cliLocation} hosting list`)
    .stdout(/You don't have any hostings/)
    .end(done)
  })
})
