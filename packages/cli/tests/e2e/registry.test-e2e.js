/* global it describe */
import utils from '../../src/utils/test-utils'
import {
  nixt,
  testsLocation,
  cliLocation
} from '../utils'

// Tests
describe('CLI Users using registry', function () {
  it('can search for non-existing socket', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} search ${utils.getRandomString()}`)
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
