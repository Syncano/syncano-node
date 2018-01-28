/* global it describe */
import {expect} from 'chai'
import pjson from '../../package.json'
import Server from '../../src'

describe('Server', function () {
  it('get major version', async () => {
    const majorVersion = new Server().majorVersion
    expect(majorVersion).to.be.equal(pjson.version.split('.')[0])
  })
})
