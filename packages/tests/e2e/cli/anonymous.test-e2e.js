/* global describe it before after */
import {cliLocation, projectTestTemplate} from '../utils'
import {
  nixt,
  deleteInstance,
  uniqueInstance,
  createProject
} from '@syncano/test-tools'

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
