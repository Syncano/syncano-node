/* global describe it */
import {assert} from 'chai'
import {run, generateMeta} from '@syncano/test'

describe('search', function () {
  const meta = generateMeta({
    request: {
      HTTP_X_SYNCANO_ACCOUNT_KEY: process.env.REGISTRY_E2E_USER_ACCOUNT_KEY_1
    }
  })

  it('by existing keyword', function (done) {
    run('search', {meta, args: {keyword: 'weather'}})
      .then(response => {
        assert.propertyVal(response.data[0], 'name', 'openweathermap')
        assert.propertyVal(response, 'code', 200)
        done()
      })
  })

  it('by random keyword', function (done) {
    run('search', {meta, args: {keyword: '1412412'}})
      .then(response => {
        assert.propertyVal(response.data, 'message', 'No sockets found!')
        assert.propertyVal(response, 'code', 404)
        done()
      })
  })
})
