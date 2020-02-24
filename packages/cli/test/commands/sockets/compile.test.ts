import {expect, test} from '@oclif/test'
import {
  createProject,
  deleteInstance,
  testsLocation,
  uniqueInstance
} from '@syncano/test-tools'
import path from 'path'

import {projectTestTemplate} from '../../utils'

describe('socket:compile', () => {
  let testInstanceName = uniqueInstance()

  test
    .stdin('\n', 10000)
    .stdout()
    .env({
      SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY,
      SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .do(async () => createProject(testInstanceName, projectTestTemplate))
    .do(async () => process.chdir(path.join(testsLocation, testInstanceName)))
    .command(['socket:create', 'test_socket'])
    .exit(0)
    .timeout(70000)
    .it('create socket', function (ctx) {
      this.timeout(70000)
      process.stdin.once('data', data => {
        if (data.toString() === '\n') {
          expect(ctx.stdout).to.contain('Your Socket configuration is stored at')
        }
      })
    })

  test
    .stdout()
    .env({
      SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY,
      SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .do(async () => process.chdir(path.join(testsLocation, testInstanceName)))
    .finally(async () => deleteInstance(testInstanceName))
    .command(['socket:compile', 'test_socket'])
    .exit(0)
    .timeout(70000)
    .it('compile successful', function (ctx) {
      this.timeout(70000)
      expect(ctx.stdout).to.contain('socket compiled:')
    })
})
