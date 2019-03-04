import {expect, test} from '@oclif/test'
import {createInstance, deleteInstance, uniqueInstance} from '@syncano/test-tools'

describe('backup:create', () => {
  let testInstanceName = uniqueInstance()

  test
    .stdout()
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
    .stderr()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .do(async () => createInstance(testInstanceName))
    .command(['backup:create'])
    .exit(0)
    .it('create', ctx => {
      expect(ctx.stderr).to.contain('Backup was created')
    })

  test
    .stdout()
    .stderr()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .finally(async () => deleteInstance(testInstanceName))
    .command(['backup:delete', '--all'])
    .exit(0)
    .it('delete', ctx => {
      expect(ctx.stderr).to.contain('All backups deleted.')
    })
})
