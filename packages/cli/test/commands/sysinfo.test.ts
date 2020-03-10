import {expect, test} from '@oclif/test'

describe('info', () => {
  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: undefined})
    .command(['sysinfo'])
    .exit(0)
    .it('runs info when not logged in', ctx => {
      expect(ctx.stdout).to.contain('npm version')
      expect(ctx.stdout).to.contain('node version')
    })
})
