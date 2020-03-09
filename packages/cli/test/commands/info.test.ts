import {expect, test} from '@oclif/test'
import sinon from 'sinon'
import {deleteConfigFile} from '@syncano/test-tools'

import session from '../../src/utils/session'

describe('info', () => {
  afterEach(() => { try { deleteConfigFile() } catch {} })
  test
    .stdout()
    .command(['info'])
    .exit(1)
    .it('runs info when not logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in!')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .command(['info'])
    .exit(0)
    .it('runs info when user is logged in', ctx => {
      expect(ctx.stdout).to.contain(`username: ${process.env.E2E_CLI_EMAIL}`)
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: 'my_project'})
    .command(['info'])
    .exit(0)
    .it('runs info when project is from env', ctx => {
      expect(ctx.stdout).to.contain('current instance: my_project')
      expect(ctx.stdout).to.contain('(taken from SYNCANO_PROJECT_INSTANCE environment variable)')
    })

  test
    .stdout()
    .skip()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: ''})
    // .stub(getSettings, sinon.stub().returns([]))
    .command(['info'])
    .exit(0)
    .it('runs info when there is a project (from config files)', ctx => {
      // expect(ctx.stdout).to.contain('No Syncano project in current folder!')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: 'my_project'})
    .stub(session, 'getInstances', sinon.stub().returns([]))
    .command(['info'])
    .exit(0)
    .it('runs info when no instances', ctx => {
      expect(ctx.stdout).to.contain('You don\'t have any instances!')
    })

})
