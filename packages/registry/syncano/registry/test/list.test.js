/* global describe it */
import {assert} from 'chai'
import {run, generateMeta} from '@syncano/test'

describe('list', function () {
  const meta = generateMeta({
    request: {
      HTTP_X_SYNCANO_ACCOUNT_KEY: process.env.E2E_USER_ACCOUNT_KEY_1
    }
  })

  it('all sockets', function (done) {
    run('list', {meta})
      .then(response => {
        assert.propertyVal(response, 'code', 200)
        done()
      })
  })
})
