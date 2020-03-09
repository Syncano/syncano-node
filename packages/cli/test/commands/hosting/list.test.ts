import {expect, test} from '@oclif/test'
import {deleteConfigFile, uniqueInstance} from '@syncano/test-tools'
import sinon from 'sinon'

import Hosting from '../../../src/utils/hosting'

describe('hosting:list', () => {
  beforeEach(() => { try { deleteConfigFile() } catch {} })
  let testInstanceName = uniqueInstance()
  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: undefined})
    .command(['hosting:list'])
    .exit(1)
    .it('when not logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in!')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .stub(Hosting, 'list', sinon.stub().resolves([]))
    .command(['hosting:list'])
    .exit(0)
    .it('when no hostings', ctx => {
      expect(ctx.stdout).to.contain('You don\'t have any hostings!')
    })
})
