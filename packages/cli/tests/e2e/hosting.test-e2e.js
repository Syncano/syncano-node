/* global describe it before after */
import fs from 'fs-extra'
import path from 'path'
import {
  nixt,
  testsLocation,
  deleteInstance,
  createProject,
  uniqueInstance
} from '@syncano/test-tools'

const cliLocation = path.join(process.cwd(), 'lib/cli.js')
const projectTestTemplate = path.join(__dirname, './assets/project/empty/')

describe('[E2E] CLI Hosting', function () {
  let testInstance = uniqueInstance()
  const hostingName = 'tests'
  const hostingName2 = 'tests2'

  const testNixt = () => nixt()
    .env('SYNCANO_PROJECT_INSTANCE', testInstance)
    .env('SYNCANO_AUTH_KEY', process.env.E2E_CLI_ACCOUNT_KEY)
    .cwd(path.join(testsLocation, testInstance))

  const copyHosting = () => {
    const hostingAssets = path.join(__dirname, './assets/hosting_test')
    fs.copySync(hostingAssets, path.join(testsLocation, testInstance, 'hosting'))
  }

  before(async () => createProject(testInstance, projectTestTemplate))
  after(async () => deleteInstance(testInstance))

  it('can add hosting', function (done) {
    testNixt()
      .before(copyHosting)
      .run(`${cliLocation} hosting add hosting`)
      .on(/Set hosting's name/)
      .respond(`${hostingName}\n`)
      .on(/Set CNAME/)
      .respond('\n')
      .on(/Do you want to use BrowserRouter/)
      .respond('\n')
      .on(/sync files now/)
      .respond('\n')
      .stdout(/sync files use: syncano-cli hosting sync/)
      .end(done)
  })

  it('can add hosting with folder outside of syncano folder', function (done) {
    testNixt()
      .run(`${cliLocation} hosting add ../../tests/e2e/assets/hosting_test`)
      .on(/Set hosting's name/)
      .respond(`${hostingName2}\n`)
      .on(/Set CNAME/)
      .respond('\n')
      .on(/Do you want to use BrowserRouter/)
      .respond('\n')
      .on(/sync files now/)
      .respond('\n')
      .stdout(/sync files use: syncano-cli hosting sync/)
      .end(done)
  })

  it('can list hosting containers', function (done) {
    testNixt()
      .run(`${cliLocation} hosting list`)
      .on(/Choose socket for which you you want to list hostings/)
      .respond('\n')
      .stdout(/name: tests/)
      .end(done)
  })

  it('can check if there are hosting files', function (done) {
    testNixt()
      .run(`${cliLocation} hosting files ${hostingName}`)
      .on(/Choose a socket which hosting files you want to see/)
      .respond('\n')
      .stdout(/You have 1 files/)
      .end(done)
  })

  it('can sync local hosting', function (done) {
    testNixt()
      .run(`${cliLocation} hosting sync ${hostingName}`)
      .stdout(/files synchronized/)
      .end(done)
  })

  it('can sync again local hosting', function (done) {
    testNixt()
      .run(`${cliLocation} hosting sync ${hostingName}`)
      .stdout(/files synchronized/)
      .end(done)
  })

  it('can delete hosting container 1', function (done) {
    testNixt()
      .run(`${cliLocation} hosting delete ${hostingName}`)
      .on(/Are you sure you/)
      .respond('Y\n')
      .stdout(/has been successfully deleted!/)
      .end(done)
  })

  it('can delete hosting container 2', function (done) {
    testNixt()
    .run(`${cliLocation} hosting delete ${hostingName2}`)
    .on(/Are you sure you/)
    .respond('Y\n')
    .stdout(/has been successfully deleted!/)
    .end(done)
  })

  it('can see there is not hosting containers', function (done) {
    testNixt()
      .run(`${cliLocation} hosting list`)
      .stdout(/You don't have any hostings/)
      .end(done)
  })
})
