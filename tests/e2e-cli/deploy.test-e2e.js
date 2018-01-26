/* global describe it before after */
import fs from 'fs-extra'
import path from 'path'
import {
  nixt,
  testsLocation,
  deleteInstance,
  createProject,
  createInstance,
  uniqueInstance,
  getRandomString
} from '@syncano/test-tools'

const cliLocation = path.join(process.cwd(), 'lib/cli.js')
const projectTestTemplate = path.join(__dirname, './assets/project/empty/')

describe('[E2E] CLI Deploy', function () {
  let testInstance = uniqueInstance()

  const testNixt = () => nixt()
    .env('SYNCANO_PROJECT_INSTANCE', testInstance)
    .env('SYNCANO_AUTH_KEY', process.env.E2E_CLI_ACCOUNT_KEY)
    .cwd(path.join(testsLocation, testInstance))

  before(async () => createProject(testInstance, projectTestTemplate))
  after(async () => deleteInstance(testInstance))

  it('can list installed sockets', function (done) {
    testNixt()
      .run(`${cliLocation} list`)
      .stdout(/No Socket was found on server nor in config!/)
      .end(done)
  })

  it('can\'t list non existing Socket', function (done) {
    testNixt()
      .run(`${cliLocation} list ${getRandomString()}`)
      .stdout(/No Socket was found on server nor in config!/)
      .end(done)
  })

  it('can create new socket', function (done) {
    testNixt()
      .run(`${cliLocation} create hello`)
      .on(/Choose template for your Socket/)
      .respond('\n')
      .stdout(/Your Socket configuration is stored at/)
      .end(done)
  })

  it('can deploy hello socket', function (done) {
    testNixt()
      .run(`${cliLocation} deploy hello`)
      .stdout(/socket synced:/)
      .end(done)
  })

  it('can call hello socket endpoint', function (done) {
    testNixt()
      .run(`${cliLocation} call hello/hello`)
      .on(/Type in value for "firstname" parameter/)
      .respond('TEST\n')
      .on(/Type in value for "lastname" parameter/)
      .respond('CLI\n')
      .code(0)
      .stdout(/Hello TEST CLI/)
      .end(done)
  })

  it('can deploy with instance creation', function (done) {
    let testInstance = uniqueInstance()

    const projectTestTemplate = path.join(__dirname, './assets/project/empty/')
    const moveTestProject = (template) => {
      fs.copySync(template, path.join(testsLocation, testInstance))
    }

    const testNixt = () => nixt()
      .env('SYNCANO_AUTH_KEY', process.env.E2E_CLI_ACCOUNT_KEY)
      .cwd(path.join(testsLocation, testInstance))

    testNixt()
      .before(() => moveTestProject(projectTestTemplate))
      .after(() => deleteInstance(testInstance))
      .run(`${cliLocation} deploy --create-instance ${testInstance}`)
      .stdout(/project synced:/)
      .end(done)
  })

  it('can\'t deploy with instance creation if instance already exist', function (done) {
    let testInstance = uniqueInstance()

    const projectTestTemplate = path.join(__dirname, './assets/project/empty/')
    const moveTestProject = (template) => {
      fs.copySync(template, path.join(testsLocation, testInstance))
    }

    const testNixt = () => nixt()
      .env('SYNCANO_AUTH_KEY', process.env.E2E_CLI_ACCOUNT_KEY)
      .cwd(path.join(testsLocation, testInstance))

    testNixt()
      .before(async () => {
        await moveTestProject(projectTestTemplate)
        await createInstance(testInstance)
      })
      .after(() => deleteInstance(testInstance))
      .run(`${cliLocation} deploy --create-instance ${testInstance}`)
      .stdout(/Instance already exist!/)
      .end(done)
  })
})
