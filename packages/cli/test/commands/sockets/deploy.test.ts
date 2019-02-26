import {expect, test} from '@oclif/test'
import {
  createProject,
  deleteInstance,
  testsLocation,
  uniqueInstance
} from '@syncano/test-tools'
import path from 'path'

import {projectTestTemplate} from '../../utils'

describe('socket:deploy', () => {
  let testInstanceName = uniqueInstance()

  test
    .stdin('\n', 10000)
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .do(async () => createProject(testInstanceName, projectTestTemplate))
    .do(async () => process.chdir(path.join(testsLocation, testInstanceName)))
    .command(['socket:create', 'test_socket'])
    .exit(0)
    .it('create socket', ctx => {
      process.stdin.once('data', data => {
        if (data === '\n') {
          expect(ctx.stdout).to.contain('Your Socket configuration is stored at')
        }
      })
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .do(async () => process.chdir(path.join(testsLocation, testInstanceName)))
    .finally(async () => deleteInstance(testInstanceName))
    .command(['socket:deploy'])
    .exit(0)
    .it('deploy successful', ctx => {
      expect(ctx.stdout).to.contain('socket synced:')
      expect(ctx.stdout).to.contain('total time:')
    })
})
