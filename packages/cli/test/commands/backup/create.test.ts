import {expect, test} from '@oclif/test'
import {createInstance, deleteConfigFile, deleteInstance, uniqueInstance} from '@syncano/test-tools'

describe('backup:create', () => {
  beforeEach(() => { try { deleteConfigFile() } catch {} })
  let testInstanceName = uniqueInstance()
  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: undefined})
    .command(['backup:create'])
    .exit(1)
    .it('when not logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in!')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .command(['backup:create'])
    .exit(1)
    .it('no project', ctx => {
      expect(ctx.stdout).to.contain('You have to attach this project to one of your instances')
    })

  test
    .stdout()
    .env({
      SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY,
      SYNCANO_PROJECT_INSTANCE: testInstanceName
    })
    .do(async () => createInstance(testInstanceName))
    .command(['backup:create'])
    .exit(0)
    .it('create', ctx => {
      expect(ctx.stdout).to.contain('Backup was created')
    })

  test
    .stdout()
    .env({
      SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY,
      SYNCANO_PROJECT_INSTANCE: testInstanceName
    })
    .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .finally(async () => deleteInstance(testInstanceName))
    .command(['backup:delete', '--all'])
    .exit(0)
    .it('delete', ctx => {
      expect(ctx.stdout).to.contain('All backups deleted.')
    })
})
