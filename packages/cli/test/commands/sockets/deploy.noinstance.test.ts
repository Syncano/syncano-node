import {expect, test} from '@oclif/test'
import {
  createProject,
  deleteInstance,
  testsLocation,
  uniqueInstance
} from '@syncano/test-tools'
import path from 'path'

import {projectTestTemplate} from '../../utils'

describe('socket:deploy:instance not found', () => {
  let testInstanceName = uniqueInstance()
  let testInstanceNameNonExist = testInstanceName + 'non-exist'

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: testInstanceNameNonExist})
    .do(async () => createProject(testInstanceName, projectTestTemplate))
    .do(async () => process.chdir(path.join(testsLocation, testInstanceName)))
    .finally(async () => deleteInstance(testInstanceName))
    .command(['socket:deploy'])
    .exit(1)
    .it('instance not found', ctx => {
      expect(ctx.stdout).to.contain(`Instance ${testInstanceNameNonExist} was not found on your account!`)
    })
})
