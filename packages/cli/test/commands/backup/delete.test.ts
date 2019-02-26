import {expect, test} from '@oclif/test'

describe('backup:delete', () => {
  test
    .stdout()
    .command(['backup:delete'])
    .exit(1)
    .it('when not logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in!')
    })
})
