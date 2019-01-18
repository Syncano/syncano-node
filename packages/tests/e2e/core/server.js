/* global it describe */
import {expect} from 'chai'

import pjson from '../../../lib-js-core/package.json'
import Server from '../../../lib-js-core/lib'

describe('Server', function () {
  it('get major version', async () => {
    const majorVersion = new Server().majorVersion
    expect(majorVersion).to.be.equal(pjson.version.split('.')[0])
  })
})
