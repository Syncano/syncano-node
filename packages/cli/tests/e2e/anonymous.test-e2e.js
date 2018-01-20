/* global describe it before after */
import path from 'path'
import {
  nixt,
  deleteInstance,
  uniqueInstance,
  createProject
} from '@syncano/test-tools'

const cliLocation = path.join(process.cwd(), 'lib/cli.js')
const projectTestTemplate = path.join(__dirname, './assets/project/empty/')

// Tests
describe('CLI Anonymous User', function () {
  let testInstance = uniqueInstance()

  const testNixt = () => nixt()

  before(async () => createProject(testInstance, projectTestTemplate))
  after(async () => deleteInstance(testInstance))

  it('can run cli list command', function (done) {
    testNixt()
      .run(`${cliLocation} list`)
      .stdout(/You are not logged in!/)
      .end(done)
  })

  it('can run cli deploy command', function (done) {
    testNixt()
      .run(`${cliLocation} list`)
      .stdout(/You are not logged in!/)
      .end(done)
  })
})
