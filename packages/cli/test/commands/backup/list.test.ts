import {expect, test} from '@oclif/test'
import {createInstance, deleteConfigFile, deleteInstance, uniqueInstance} from '@syncano/test-tools'

describe('backup:list', () => {
  beforeEach(() => { try { deleteConfigFile() } catch {} })
  let testInstanceName = uniqueInstance()
  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: undefined})
    .command(['backup:list'])
    .exit(1)
    .it('when not logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in!')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .do(() => createInstance(testInstanceName))
    .finally(async () => deleteInstance(testInstanceName))
    .command(['backup:list'])
    // .exit(1)
    .it('when no backups', ctx => {
      expect(ctx.stdout).to.contain('You don\'t have any backups!')
    })
})
