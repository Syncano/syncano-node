/* global describe it */
import path from 'path'
import {
  nixt,
  deleteInstance,
  createInstance,
  uniqueInstance
} from '@syncano/test-tools'

const cliLocation = path.join(process.cwd(), 'lib/cli.js')

describe('[E2E] CLI Instance', function () {
  const testNixt = () => nixt()
    .env('SYNCANO_AUTH_KEY', process.env.E2E_CLI_ACCOUNT_KEY)

  it('can create an instance', function (done) {
    const testInstance = uniqueInstance()

    testNixt()
      .before(() => createInstance(testInstance))
      .after(() => deleteInstance(testInstance))
      .run(`${cliLocation} instance create ${testInstance}`)
      .stdout(/Instance already exist!/)
      .end(done)
  })

  it('can\'t create an instance if already exist', function (done) {
    const testInstance = uniqueInstance()

    testNixt()
      .after(() => deleteInstance(testInstance))
      .run(`${cliLocation} instance create ${testInstance}`)
      .stdout(/has been created/)
      .end(done)
  })

  it.skip('can list if there is no instances', function (done) {
    testNixt()
      .run(`${cliLocation} instance list`)
      .stdout(/You don't have any instances!/)
      .end(done)
  })

  it('can list instances', function (done) {
    const testInstance1 = uniqueInstance()
    const testInstance2 = uniqueInstance()

    testNixt()
      .before(async () => {
        await createInstance(testInstance1)
        await createInstance(testInstance2)
      })
      .after(async () => {
        await deleteInstance(testInstance1)
        await deleteInstance(testInstance2)
      })
      .run(`${cliLocation} instance list`)
      .stdout(/Instances:/)
      .stdout(new RegExp(testInstance1))
      .stdout(new RegExp(testInstance2))
      .end(done)
  })

  it('can delete instance', function (done) {
    const testInstance = uniqueInstance()

    testNixt()
      .before(async () => {
        await createInstance(testInstance)
      })
      .run(`${cliLocation} instance delete ${testInstance}`)
      .stdout(/Instance was deleted successfully!/)
      .end(done)
  })
})
