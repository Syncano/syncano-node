import {expect, test} from '@oclif/test'
import {
  createProject,
  deleteConfigFile,
  deleteInstance,
  testsLocation,
  uniqueInstance
} from '@syncano/test-tools'
import path from 'path'

import {projectTestTemplate} from '../../utils'

describe('hosting:add', () => {
  afterEach(() => { try { deleteConfigFile() } catch {} })
  let testInstanceName = uniqueInstance()
  test
    .stdout()
    .env({
      SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY,
      SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .do(async () => createProject(testInstanceName, projectTestTemplate))
    .do(async () => process.chdir(path.join(testsLocation, testInstanceName)))
    .command([
      'hosting:add',
      'web',
      '--sync',
      '--browser-router-on',
      '--without-cname',
      '--name=testhosting'
    ])
    .exit(0)
    .it('adding hosting with sync', ctx => {
      expect(ctx.stdout).to.contain('testhosting is available at')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .finally(async () => deleteInstance(testInstanceName))
    .command(['hosting:list'])
    .exit(0)
    .it('list hosting', ctx => {
      expect(ctx.stdout).to.contain('name: testhosting')
      expect(ctx.stdout).to.contain('BrowserRouter: ✓')
      expect(ctx.stdout).to.contain('local path: web')
      expect(ctx.stdout).to.contain('sync status: ✓')
    })
})
