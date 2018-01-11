/* global describe it */
import {assert} from 'chai'
import {run, generateMeta} from '@syncano/test'

describe('upload', function () {
  const meta = generateMeta({
    request: {
      HTTP_X_SYNCANO_ACCOUNT_KEY: process.env.REGISTRY_E2E_USER_ACCOUNT_KEY_1
    }
  })

  // it('file', function (done) {
  //   run('upload', {meta, args: {keyword: 'weather'}})
  //     .then(response => {
  //       assert.propertyVal(response.data[0], 'name', 'openweathermap')
  //       assert.propertyVal(response, 'code', 200)
  //       done()
  //     })
  // })
})
