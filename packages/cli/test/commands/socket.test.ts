import {expect, test} from '@oclif/test'
import {
  createProject,
  deleteConfigFile,
  deleteInstance,
  testsLocation,
  uniqueInstance
} from '@syncano/test-tools'
import path from 'path'

import {projectTestTemplate} from '../utils'

describe('socket:list', () => {
  beforeEach(() => { try { deleteConfigFile() } catch {} })
  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: undefined})
    .command(['socket:list'])
    .exit(1)
    .it('when not logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in!')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .command(['socket:list'])
    .exit(1)
    .it('when no project', ctx => {
      expect(ctx.stdout).to.contain('You have to attach this project to one of your instances')
    })
})

describe('socket', () => {
  let testInstanceName = uniqueInstance()
  let testInstanceNameNonExist = testInstanceName + 'non-exist'

  before(async () => {
    await createProject(testInstanceName, projectTestTemplate)
    process.chdir(path.join(testsLocation, testInstanceName))
  })

  after(async () => {
    await deleteInstance(testInstanceName)
  })

  test
    .stdin('\n', 4000)
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
    .command(['socket:create', 'test_socket'])
    .exit(0)
    .it('can be created', ctx => {
      expect(ctx.stdout).to.contain('Your Socket configuration is stored at')
    })

  describe('socket:hot', () => {
    test
      .stdout()
      .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
      .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
      .command(['socket:hot', '--mocked'])
      .exit(0)
      .it('runs in hot mode', ctx => {
        expect(ctx.stdout).to.contain('socket synced')
      })
  })

  describe('socket:compile', () => {
    test
      .stdout()
      .env({
        SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY,
        SYNCANO_PROJECT_INSTANCE: testInstanceName
      })
      .command(['socket:compile', 'test_socket'])
      .exit(0)
      .timeout(70000)
      .it('compiles successfully', function (ctx) {
        this.timeout(70000)
        expect(ctx.stdout).to.contain('socket compiled:')
      })
  })

  describe('socket:deploy', () => {
    test
      .stdout()
      .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
      .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
      .command(['socket:deploy', 'test_socket'])
      .exit(0)
      .it('deploys successfully', ctx => {
        expect(ctx.stdout).to.contain('socket synced:')
        expect(ctx.stdout).to.contain('total time:')
      })

    test
      .stdout()
      .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
      .env({SYNCANO_PROJECT_INSTANCE: testInstanceNameNonExist})
      .command(['socket:deploy'])
      .exit(1)
      .it('deploy fails when instance does not exists', ctx => {
        expect(ctx.stdout).to.contain(`Instance ${testInstanceNameNonExist} was not found on your account!`)
      })

    test
      .stdout()
      .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
      .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
      .command(['socket:deploy', '--force'])
      .exit(0)
      .it('can be deployed with --force flag', ctx => {
        expect(ctx.stdout).to.contain('total time:')
      })
  })

  describe('socket:config', () => {
    test
      .stdout()
      .env({SYNCANO_AUTH_KEY: ''})
      .command(['socket:config'])
      .exit(1)
      .it('can not be configured as unauthenticated user', ctx => {
        expect(ctx.stdout).to.contain('You are not logged in!')
      })

    test
      .stdout()
      .stderr()
      .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
      .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
      .command(['socket:config:set', 'test_socket', 'TEST_VAR', 'test_value'])
      .exit(1)
      .it('can not set variable which doesn\'t exist in socket.yml file', ctx => {
        expect(ctx.stderr).to.contain('No such config option!')
      })

    test
      .stdout()
      .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
      .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
      .command(['socket:config:show', 'test_socket'])
      .exit(0)
      .it('can not configure socket without options', ctx => {
        expect(ctx.stdout).to.contain('This Socket doesn\'t have any config options')
      })
  })

  describe('socket:call', () => {
    test
      .stdout()
      .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
      .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
      .command(['socket:call', 'test_socket/hello', '--firstname', 'john', '--lastname', 'doe'])
      .do(ctx => expect(ctx.stdout).to.contain('Hello john doe!'))
      .it('can call test_socket/hello endpoint')
  })

  describe('socket:list', () => {
    test
      .stdout()
      .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
      .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
      .command(['socket:list', 'not_existing_socket'])
      .exit(1)
      .it('runs info when project is from env', ctx => {
        expect(ctx.stdout).to.contain('No Socket was found on server nor in config!')
      })

    test
      .stdout()
      .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
      .env({SYNCANO_PROJECT_INSTANCE: testInstanceName})
      .command(['socket:list'])
      .exit(0)
      .it('shows test_socket', ctx => {
        expect(ctx.stdout).to.contain('socket: test_socket')
      })
  })
})
