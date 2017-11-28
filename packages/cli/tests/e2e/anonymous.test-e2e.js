/* global describe it */
import path from 'path'
import { nixt, testsLocation } from '@syncano/test-tools'

const cliLocation = path.join(process.cwd(), 'lib/cli.js')

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
