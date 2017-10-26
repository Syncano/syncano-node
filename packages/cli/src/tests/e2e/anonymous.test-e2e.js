import {
  nixt,
  testsLocation,
  cliLocation
} from '../utils'

// Tests
describe('CLI Anonymous User', function () {
  it('can run cli list command', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} list`)
      .stdout(/You are not logged in!/)
      .end(done)
  })

  it('can run cli deploy command', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} list`)
      .stdout(/You are not logged in!/)
      .end(done)
  })
})
