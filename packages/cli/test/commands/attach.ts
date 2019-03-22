
import {expect, test} from '@oclif/test'
import {createInstance, deleteInstance, uniqueInstance} from '@syncano/test-tools'

describe('attach', () => {
  const testInstanceName = uniqueInstance()

  test
    .stdout()
    .command(['attach'])
    .exit(1)
    .it('runs info when not logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in!')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .do(async () => createInstance(testInstanceName))
    .finally(async () => deleteInstance(testInstanceName))
    .command([
      'attach',
      `-n ${testInstanceName}`
    ])
    .exit(0)
    .it('attach to instance', ctx => {
      expect(ctx.stdout).to.contain(`Your project is attached to  ${testInstanceName} instance now!`)
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .finally(async () => deleteInstance(`${testInstanceName}1`))
    .command([
      'attach',
      `-c ${testInstanceName}1`
    ])
    .exit(0)
    .it('create new instance', ctx => {
      expect(ctx.stdout).to.contain(`Your project is attached to ${testInstanceName}1 instance now!`)
    })
})
