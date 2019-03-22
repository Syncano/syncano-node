import {expect, test} from '@oclif/test'

describe('login', () => {
  test
    .stdout()
    .command([
      'login',
      '-e badEmail',
      '-p TestPasswrod'
    ])
    .exit(1)
    .it('runs login with bad email', ctx => {
      expect(ctx.stdout).to.contain('Enter a valid email address.')
    })

  test
    .stdout()
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
    .command(['logout'])
    .exit(0)
    .it('logout', ctx => {
      expect(ctx.stdout).to.contain(' ')
    })
})
