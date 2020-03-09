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

describe('hosting:project:deploy', () => {
  afterEach(() => { try { deleteConfigFile() } catch {} })
  let testInstanceName = uniqueInstance()

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .do(async () => createProject(testInstanceName, projectTestTemplate))
    .do(async () => process.chdir(path.join(testsLocation, testInstanceName)))
    .command(['socket:deploy'])
    .exit(0)
    .it('deploy successful', ctx => {
      expect(ctx.stdout).to.match(/project: .* updated \d+ ms/)
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .command([
      'hosting:add',
      'web',
      '--sync',
      '--browser-router-on',
      '--cname=test-syncano.com',
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
    .command(['socket:deploy'])
    .exit(0)
    .it('deploy once again', ctx => {
      expect(ctx.stdout).to.match(/project: .* updated \d+ ms/)
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .finally(async () => deleteInstance(testInstanceName))
    .command(['hosting:list'])
    .exit(0)
    .it('list hosting with cname', ctx => {
      expect(ctx.stdout).to.contain('test-syncano.com')
    })
})
