import {expect, test} from '@oclif/test'

describe('socket:config', () => {
  test
    .stdout()
    .command(['socket:config'])
    .exit(1)
    .it('when not logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in!')
    })
})
