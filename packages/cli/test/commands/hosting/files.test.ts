import {expect, test} from '@oclif/test'
import {deleteConfigFile, uniqueInstance} from '@syncano/test-tools'
import sinon from 'sinon'

import Hosting from '../../../src/utils/hosting'

describe('hosting:files', () => {
  beforeEach(() => { try { deleteConfigFile() } catch {} })
  let testInstanceName = uniqueInstance()
  test
    .stdout()
    .command(['hosting:files'])
    .exit(1)
    .it('when not logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in!')
    })

  test
    .stdout()
    .env({
      SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY
    })
    .command(['hosting:files'])
    .exit(1)
    .it('when no instance', ctx => {
      expect(ctx.stdout).to.contain('You have to attach this project to one of your instances.')
    })

  test
    .stdout()
    .env({
      SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY,
      SYNCANO_PROJECT_INSTANCE: testInstanceName,
    })
    .stub(Hosting, 'get', sinon.stub().resolves(null))
    .command(['hosting:files', 'hostyng'])
    .exit(1)
    .it('when no hostings', ctx => {
      expect(ctx.stdout).to.contain('There is no hosting')
    })

  test
    .stdout()
    .env({
      SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY,
      SYNCANO_PROJECT_INSTANCE: testInstanceName,
    })
    .stub(Hosting, 'get', sinon.stub().resolves({
      listFiles: () => ([{
        size: 15
      }])
    }))
    .command(['hosting:files', 'hostyng'])
    .it('when there are hostings', ctx => {
      expect(ctx.stdout).to.contain('Hosting hostyng has 1 files:')
    })
})
