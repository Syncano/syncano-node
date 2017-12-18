/* global it describe */
import path from 'path'

import {
  nixt,
  testsLocation,
  getRandomString
} from '@syncano/test-tools'

const cliLocation = path.join(process.cwd(), 'lib/cli.js')

// Tests
describe('CLI Users using registry', function () {
  it('can search for non-existing socket', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} search ${getRandomString()}`)
      .stdout(/No sockets found/)
      .end(done)
  })

  it('can search for existing socket', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} search openweathermap`)
      .stdout(/socket\(s\) found/)
      .end(done)
  })
})
