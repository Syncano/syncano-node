import {expect, test} from '@oclif/test'
import {createInstance, deleteInstance, uniqueInstance} from '@syncano/test-tools'
// import sinon from 'sinon'

// import session from '../../../lib/utils/session'

describe('socket:list', () => {
  let testInstanceName = uniqueInstance()
  test
    .stdout()
    .command(['socket:list'])
    .exit(1)
    .it('when not logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in!')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .command(['socket:list'])
    .exit(1)
    .it('when no project', ctx => {
      expect(ctx.stdout).to.contain('You have to attach this project to one of your instances')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .command(['socket:list', 'not_existing_socket'])
    .exit(1)
    .it('runs info when project is from env', ctx => {
      expect(ctx.stdout).to.contain('No Socket was found on server nor in config!')
    })
})
