import {expect, test} from '@oclif/test'
import {
  createProject,
  deleteInstance,
  testsLocation,
  uniqueInstance
} from '@syncano/test-tools'
import path from 'path'

import {projectTestTemplate} from '../../utils'

describe('socket:deploy:with force', () => {
  let testInstanceName = uniqueInstance()

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .do(async () => createProject(testInstanceName, projectTestTemplate))
    .do(async () => process.chdir(path.join(testsLocation, testInstanceName)))
    .finally(async () => deleteInstance(testInstanceName))
    .command(['socket:deploy', '--force'])
    .exit(0)
    .it('deploy with force', ctx => {
      expect(ctx.stdout).to.contain('total time:')
    })
})
