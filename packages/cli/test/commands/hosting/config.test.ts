import {expect, test} from '@oclif/test'
import {deleteConfigFile, uniqueInstance} from '@syncano/test-tools'
import sinon from 'sinon'

import Hosting from '../../../src/utils/hosting'

describe('hosting:config', () => {
  afterEach(() => { try { deleteConfigFile() } catch {} })
  let testInstanceName = uniqueInstance()
  const hosting = {
    name: 'hosting',
    existLocally: true,
    configure: () => {},
    getCNAME: () => 'testCNAME',
    getCnameURL: () => 'testCNAME',
    hasCNAME: () => true,
    config: {browser_router: true},
  }

  const envConfig = {
    SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY,
    SYNCANO_PROJECT_INSTANCE: testInstanceName,
  }
  test
    .stdout()
    .command(['hosting:config'])
    .exit(1)
    .it('when not logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in!')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .command(['hosting:config'])
    .exit(1)
    .it('when no hostings', ctx => {
      const expectedMessage = 'You have to attach this project to one of your instances.'
      expect(ctx.stdout).to.contain(expectedMessage)
    })

  test
    .stderr()
    .env(envConfig)
    .stub(Hosting, 'get', sinon.stub().resolves({
      ...hosting,
      existLocally: false,
    }))
    .command(['hosting:config', 'namename'])
    .exit(1)
    .it('when hosting doesn\'t exist', ctx => {
      const expectedMessage = 'No such hosting'
      expect(ctx.stderr).to.contain(expectedMessage)
    })

  test
    .stderr()
    .env(envConfig)
    .stub(Hosting, 'get', sinon.stub().resolves({
      ...hosting,
      hasCNAME: () => false,
    }))
    .command([
      'hosting:config', 'name',
      '-d', 'test',
    ])
    .exit(1)
    .it('remove cname when hosting haven\'t cname', ctx => {
      const expectedMessage = 'This hosting doesn\'t have such CNAME!'
      expect(ctx.stderr).to.contain(expectedMessage)
    })

  test
    .stdout()
    .env(envConfig)
    .stub(Hosting, 'get', sinon.stub().resolves(hosting))
    .command([
      'hosting:config', 'name',
      '-d', 'testCNAME',
    ])
    .exit(0)
    .it('success remove cname', ctx => {
      const expectedMessage = 'Configuration successfully updated!'
      expect(ctx.stdout).to.contain(expectedMessage)
    })

  test
    .stdout()
    .env(envConfig)
    .stub(Hosting, 'get', sinon.stub().resolves(hosting))
    .command([
      'hosting:config', 'name',
      '-c', 'cname'
    ])
    .exit(0)
    .it('success set cname', ctx => {
      const expectedMessage = 'Configuration successfully updated!'
      expect(ctx.stdout).to.contain(expectedMessage)
    })

  test
    .stdout()
    .env(envConfig)
    .stub(Hosting, 'get', sinon.stub().resolves(hosting))
    .command([
      'hosting:config', 'name',
      '-b',
    ])
    .exit(0)
    .it('success turn on BrowserRouter support', ctx => {
      const expectedMessage = 'Configuration successfully updated!'
      expect(ctx.stdout).to.contain(expectedMessage)
      expect(ctx.stdout).to.contain('hosting')
    })
})
