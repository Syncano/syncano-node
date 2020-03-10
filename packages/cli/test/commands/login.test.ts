import {expect, test} from '@oclif/test'
import {deleteConfigFile} from '@syncano/test-tools'

describe('login', () => {
  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: undefined})
    .command([
      'login',
      '-e badEmail',
      '-p TestPasswrod'
    ])
    .exit(1)
    .finally(() => {
      try { deleteConfigFile() } catch {}
    })
    .it('runs login with bad email', ctx => {
      expect(ctx.stdout).to.contain('Enter a valid email address.')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: undefined})
    .command([
      'login',
      `-e ${process.env.E2E_CLI_EMAIL}`,
      '-p TestPasswrod'
    ])
    .exit(1)
    .finally(() => {
      try { deleteConfigFile() } catch {}
    })
    .it('runs login with invalid password', ctx => {
      expect(ctx.stdout).to.contain('Invalid password.')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: undefined})
    .command([
      'login',
      `-e ${process.env.E2E_CLI_EMAIL}`,
      `-p ${process.env.E2E_CLI_PASSWORD}`
    ])
    .exit(0)
    .it('runs login correctly', ctx => {
      expect(ctx.stdout).to.contain("You\'re in! Enjoy! 👍")
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: undefined})
    .command(['logout'])
    .exit(0)
    .finally(() => {
      try { deleteConfigFile() } catch {}
    })
    .it('logout', ctx => {
      expect(ctx.stdout).to.contain(' ')
    })
})
