import {expect, test} from '@oclif/test'
import {createInstance, deleteInstance, uniqueInstance} from '@syncano/test-tools'
import sinon from 'sinon'

import Hosting from '../../../src/utils/hosting'

describe('hosting:list', () => {
  let testInstanceName = uniqueInstance()
  test
    .stdout()
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
