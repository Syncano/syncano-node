import {expect, test} from '@oclif/test'
import {deleteConfigFile, uniqueInstance} from '@syncano/test-tools'
import sinon from 'sinon'

import Hosting from '../../../src/utils/hosting'

describe('hosting:delete', () => {
  beforeEach(() => { try { deleteConfigFile() } catch {} })
  let testInstanceName = uniqueInstance()
  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: undefined})
    .command(['hosting:delete'])
    .exit(1)
    .it('when not logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in!')
    })

  test
    .stdout()
    .env({
      SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY
    })
    .command(['hosting:delete'])
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
    .command(['hosting:delete', 'hosting'])
    .exit(1)
    .it('when hosting doesn\'t exist', ctx => {
      expect(ctx.stdout).to.contain('Couldn\'t find any hosting named')
    })

  test
    .stdout()
    .env({
      SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY,
      SYNCANO_PROJECT_INSTANCE: testInstanceName,
    })
    .stub(Hosting, 'get', sinon.stub().resolves({
      existLocally: true,
      delete: () => new Promise(resolve => resolve({name: 'hosting2'}))
    }))
    .command(['hosting:delete', 'hosting2', '-c'])
    .it('when hosting is deleted', ctx => {
      expect(ctx.stdout).to.contain('Hosting hosting2 has been successfully deleted!')
    })
})
