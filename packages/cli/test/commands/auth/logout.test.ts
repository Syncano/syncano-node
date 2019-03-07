import {expect, test} from '@oclif/test'

describe('logout', () => {
  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: ''})
    .command(['logout'])
    .exit(1)
    .it('when no logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in! ')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .command(['logout'])
    .exit(0)
    .it('when logged in', ctx => {
      expect(ctx.stdout).to.contain('You have been logged out!')
    })
})
