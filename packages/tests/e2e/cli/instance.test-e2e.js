/* global describe it */
import {
  nixt,
  deleteInstance,
  createInstance,
  uniqueInstance
} from '@syncano/test-tools'

import {cliLocation} from '../utils'

describe('CLI Instance', function () {
  let testInstance = uniqueInstance()
  const testNixt = () => nixt()
    .env('SYNCANO_AUTH_KEY', process.env.E2E_CLI_ACCOUNT_KEY)

  it('can create an instance', function (done) {
    testInstance = uniqueInstance()

    testNixt()
      .run(`${cliLocation} instance:create ${testInstance}`)
      .stdout(/has been created/)
      .code(0)
      .end(done)
  })

  it('can\'t create an instance if already exist', function (done) {
    testNixt()
      .run(`${cliLocation} instance:create ${testInstance}`)
      .stdout(/Instance already exist!/)
      .code(1)
      .end(done)
  })

  it('can list instance via info command', function (done) {
    testInstance = uniqueInstance()

    testNixt()
      .before(async () => await createInstance(testInstance))
      .after(async () => await deleteInstance(testInstance))
      .run(`${cliLocation} info ${testInstance}`)
      .stdout(new RegExp(testInstance))
      .code(0)
      .end(done)
  })

  it.skip('can list if there is no instances', function (done) {
    testNixt()
      .run(`${cliLocation} instance:list`)
      .stdout(/You don't have any instances!/)
      .code(0)
      .end(done)
  })

  it.skip('can list instances', function (done) {
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
      .run(`${cliLocation} instance:list`)
      .stdout(/Instances:/)
      .stdout(new RegExp(testInstance1))
      .stdout(new RegExp(testInstance2))
      .code(0)
      .end(done)
  })

  it('can delete instance', function (done) {
    testInstance = uniqueInstance()

    testNixt()
      .before(async () => await createInstance(testInstance))
      .run(`${cliLocation} instance:delete ${testInstance}`)
      .stdout(/Instance was deleted successfully!/)
      .code(0)
      .end(done)
  })
})
