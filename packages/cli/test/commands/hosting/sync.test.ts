import {expect, test} from '@oclif/test'
import {
  deleteConfigFile,
  createProject,
  deleteInstance,
  testsLocation,
  uniqueInstance
} from '@syncano/test-tools'
import path from 'path'

import {projectTestTemplate} from '../../utils'

describe('hosting:sync', () => {
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
      '--dont-sync',
      '--browser-router-on',
      '--without-cname',
      '--name=testhosting1'
    ])
    .exit(0)
    .it('adding hosting without sync', ctx => {
      expect(ctx.stdout).to.contain('To sync files use: npx s hosting:sync testhosting1')
    })

  test
    .stdout()
    .env({
      SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY,
      SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .command([
      'hosting:add',
      'web',
      '--dont-sync',
      '--browser-router-on',
      '--without-cname',
      '--name=testhosting2'
    ])
    .exit(0)
    .it('adding hosting without sync', ctx => {
      expect(ctx.stdout).to.contain('To sync files use: npx s hosting:sync testhosting2')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .command(['hosting:list'])
    .exit(0)
    .it('list not synced hostings', ctx => {
      expect(ctx.stdout).to.contain('name: testhosting1')
      expect(ctx.stdout).to.contain('name: testhosting2')
      expect(ctx.stdout).to.contain('BrowserRouter: ✓')
      expect(ctx.stdout).to.contain('local path: web')
      expect(ctx.stdout).to.contain('sync status: x')
      expect(ctx.stdout).to.not.contain('sync status: ✓')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .command(['hosting:sync', 'testhosting1'])
    .exit(0)
    .it('sync first hosting', ctx => {
      expect(ctx.stdout).to.contain('1 files synchronized, 9 B in total')
      expect(ctx.stdout).to.contain('Syncing hosting files for testhosting1')
      expect(ctx.stdout).to.contain('✓ File added:   index.html')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .finally(async () => deleteInstance(testInstanceName))
    .command(['hosting:sync'])
    .exit(0)
    .it('sync all hostings', ctx => {
      expect(ctx.stdout).to.contain('Syncing hosting files for testhosting1')
      expect(ctx.stdout).to.contain('Syncing hosting files for testhosting2')
      expect(ctx.stdout).to.contain('1 files synchronized, 9 B in total')
      expect(ctx.stdout).to.contain('1 files synchronized, 0 B in total')
      expect(ctx.stdout).to.contain('✓ File added:   index.html')
      expect(ctx.stdout).to.contain('✓ File skipped: index.html')
    })
})
