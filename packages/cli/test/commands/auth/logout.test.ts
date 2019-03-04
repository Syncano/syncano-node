import {expect, test} from '@oclif/test'

describe('logout', () => {
  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .command(['logout'])
    .it('logout', ctx => {
      expect(ctx.stdout).to.contain('You have been logged out!')
    })
})
