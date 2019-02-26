import {expect, test} from '@oclif/test'
import {deleteInstance, uniqueInstance} from '@syncano/test-tools'

describe('instance:create', () => {
  let testInstanceName = uniqueInstance()
  test
    .stdout()
    .command(['instance:create', 'instanceName'])
    .exit(1)
    .it('when not logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in!')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .finally(async () => deleteInstance(testInstanceName))
    .command(['instance:create', testInstanceName])
    .exit(0)
    .it('when instance name was provided', ctx => {
      expect(ctx.stdout).to.contain(`Syncano Instance ${testInstanceName} has been created!`)
    })
})
