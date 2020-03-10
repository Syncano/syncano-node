import {expect, test} from '@oclif/test'

describe('backup:delete', () => {
  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: undefined})
    .command(['backup:delete'])
    .exit(1)
    .it('when not logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in!')
    })
})
