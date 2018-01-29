/* global describe it before after */
import replace from 'replace'
import path from 'path'
import {
  nixt,
  testsLocation,
  deleteInstance,
  createProject,
  uniqueInstance,
  getRandomString,
  createdSocketName
} from '@syncano/test-tools'

const cliLocation = path.join(process.cwd(), 'lib/cli.js')
const projectTestTemplate = path.join(__dirname, './assets/project/empty/')

describe('[E2E] CLI Socket', function () {
  let testInstance = uniqueInstance()

  const testNixt = () => nixt()
    .env('SYNCANO_PROJECT_INSTANCE', testInstance)
    .env('SYNCANO_AUTH_KEY', process.env.E2E_CLI_ACCOUNT_KEY)
    .cwd(path.join(testsLocation, testInstance))

  const linkSyncanoPackages = () => {
    replace({
      regex: '"@syncano/build-es6": "0.4.1"',
      replacement: `"@syncano/build-es6": "${path.join(__dirname, '../../../../build-es6')}"`,
      paths: [path.join(testsLocation, testInstance)],
      recursive: true,
      silent: true
    })
  }

  before(async () => createProject(testInstance, projectTestTemplate))
  after(async () => deleteInstance(testInstance))

  it('can create new socket', function (done) {
    testNixt()
      .run(`${cliLocation} create hello`)
      .on(/Choose template for your Socket/)
      .respond('\n')
      .stdout(/Your Socket configuration is stored at/)
      .end(done)
  })

  it('can list installed sockets', function (done) {
    testNixt()
      .run(`${cliLocation} list`)
      .stdout(/Description of hello/)
      .end(done)
  })

  it('can list single installed socket with docs', function (done) {
    testNixt()
      .run(`${cliLocation} list hello`)
      .stdout(/input:/)
      .stdout(/output:/)
      .end(done)
  })

  it('can\'t list non existing Socket', function (done) {
    testNixt()
      .run(`${cliLocation} list ${getRandomString()}`)
      .stdout(/No Socket was found on server nor in config!/)
      .end(done)
  })

  it('can deploy hello socket', function (done) {
    testNixt()
      .before(linkSyncanoPackages)
      .env('DEBUG', '*')
      .run(`${cliLocation} deploy hello`)
      .stdout(/socket synced:/)
      .end(done)
  })

  it('can set config of socket', function (done) {
    testNixt()
      .run(`${cliLocation} config-set hello name test`)
      .end(done)
  })

  it('can create new socket', function (done) {
    testNixt()
      .run(`${cliLocation} create ${createdSocketName}`)
      .on(/Choose template for your Socket/)
      .respond('\n')
      .stdout(/Your Socket configuration is stored at/)
      .end(done)
  })

  it('can\'t create new socket with the name of existing socket', function (done) {
    testNixt()
      .run(`${cliLocation} create ${createdSocketName}`)
      .on(/Choose template for your Socket/)
      .respond('\n')
      .stdout(/Socket with given name already exist!/)
      .end(done)
  })
})
