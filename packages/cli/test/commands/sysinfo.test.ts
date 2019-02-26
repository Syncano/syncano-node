import {expect, test} from '@oclif/test'

describe('info', () => {
  test
    .stdout()
    .command(['sysinfo'])
    .exit(0)
    .it('runs info when not logged in', ctx => {
      expect(ctx.stdout).to.contain('npm version')
      expect(ctx.stdout).to.contain('node version')
    })
})
