import {expect, test} from '@oclif/test'
import {deleteInstance, uniqueInstance, deleteConfigFile} from '@syncano/test-tools'

describe('attach', () => {
  const testInstanceName = uniqueInstance()

  test
    .stdout()
    .command(['attach'])
    .exit(1)
    .it('runs when not logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in!')
    })

  test
    .stdout()
    .stdin('no\n', 1000)
    .env({
      SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY,
      SYNCANO_PROJECT_INSTANCE: testInstanceName
    })
    .command(['attach'])
    .exit(1)
    .it('project is already attached', ctx => {
      expect(ctx.stdout).to.contain('')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .command([
      'attach',
      '-c',
      testInstanceName
    ])
    .exit(0)
    .it('create new instance', ctx => {
      expect(ctx.stdout).to.contain(`Your project is attached to ${testInstanceName} instance now!`)
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .finally(async () => {
      deleteConfigFile()
      await deleteInstance(testInstanceName)
    })
    .command([
      'attach',
      '-n',
      testInstanceName
    ])
    .exit(0)
    .it('attach to existing instance', ctx => {
      expect(ctx.stdout).to.contain(`Your project is attached to ${testInstanceName} instance now!`)
    })
})