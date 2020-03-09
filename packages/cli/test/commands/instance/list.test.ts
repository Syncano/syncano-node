import {expect, test} from '@oclif/test'
import {createInstance, deleteConfigFile, deleteInstance, uniqueInstance} from '@syncano/test-tools'
import sinon from 'sinon'

import session from '../../../src/utils/session'

describe('instance:list', () => {
  beforeEach(() => { try { deleteConfigFile() } catch {} })

  let testInstanceName = uniqueInstance()
  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: undefined})
    .command(['instance:list'])
    .exit(1)
    .it('when not logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in!')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .stub(session, 'getInstances', sinon.stub().resolves([]))
    .command(['instance:list'])
    .exit(0)
    .it('when no instances', ctx => {
      expect(ctx.stdout).to.contain('You don\'t have any instances!')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .stub(session, 'getInstances', sinon.stub().resolves([{name: 'instance1'}, {name: 'instance2'}]))
    .command(['instance:list'])
    .exit(0)
    .it('when 2 instances', ctx => {
      expect(ctx.stdout).to.contain('- instance1')
      expect(ctx.stdout).to.contain('- instance2')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .do(async () => createInstance(testInstanceName))
    .finally(async () => deleteInstance(testInstanceName))
    .command(['instance:list'])
    .exit(0)
    .it('after instance creation', ctx => {
      expect(ctx.stdout).to.contain(`- ${testInstanceName}`)
    })
})
