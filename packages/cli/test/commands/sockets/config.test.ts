import {expect, test} from '@oclif/test'
import {
  createProject,
  deleteInstance,
  testsLocation,
  uniqueInstance
} from '@syncano/test-tools'
import path from 'path'

import {projectTestTemplate} from '../../utils'

describe('socket:config', () => {
  let testInstanceName = uniqueInstance()

  after(() => {
    deleteInstance(testInstanceName)
  })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: ''})
    .command(['socket:config'])
    .exit(1)
    .it('when not logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in!')
    })

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
    .command(['socket:deploy', 'test_socket'])
    .exit(0)
    .it('deploy socket')

  test
    .stdout()
    .stderr()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .do(async () => process.chdir(path.join(testsLocation, testInstanceName)))
    .command(['socket:config:set', 'test_socket', 'TEST_VAR', 'test_value'])
    .exit(1)
    .it('set variable which doesn\'t exist in config file', ctx => {
      expect(ctx.stderr).to.contain('No such config option!')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .do(async () => process.chdir(path.join(testsLocation, testInstanceName)))
    .command(['socket:config:show', 'test_socket'])
    .exit(0)
    .it('show when there is no options', ctx => {
      expect(ctx.stdout).to.contain('This Socket doesn\'t have any config options')
    })
})
