import {expect, test} from '@oclif/test'
import {createInstance, uniqueInstance} from '@syncano/test-tools'

describe('instance:delete', () => {
  let testInstanceName = uniqueInstance()
  test
    .stdout()
    .command(['instance:delete', 'instanceName'])
    .exit(1)
    .it('when not logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in!')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .do(async () => createInstance(testInstanceName))
    .command(['instance:delete', testInstanceName])
    .exit(0)
    .it('when instance name was provided', ctx => {
      expect(ctx.stdout).to.contain(`Syncano Instance ${testInstanceName} has been deleted successfully.`)
    })
})
