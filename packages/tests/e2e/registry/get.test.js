/* global describe it */
import {assert} from 'chai'
import {run, generateMeta} from '@syncano/test'

describe('get', function () {
  let existingSocket = {
    name: 'openweathermap'
  }

  let nonExistingSocket = {
    name: 'openweathermap123'
  }

  const meta = generateMeta({
    request: {
      HTTP_X_SYNCANO_ACCOUNT_KEY: process.env.REGISTRY_E2E_USER_ACCOUNT_KEY_1
    }
  })

  it('existing socket', function (done) {
    run('get', {args: existingSocket, meta})
      .then(response => {
        assert.propertyVal(response.data, 'name', 'openweathermap')
        assert.propertyVal(response, 'code', 200)
        done()
      })
  })

  it('existing socket with version', function (done) {
    const socket = Object.assign({}, existingSocket)
    socket.version = '0.0.29'

    run('get', {args: socket, meta})
      .then(response => {
        assert.propertyVal(response.data, 'name', 'openweathermap')
        assert.propertyVal(response.data, 'version', socket.version)
        assert.propertyVal(response, 'code', 200)
        done()
      })
  })

  it('existing socket with wrong version', function (done) {
    const socket = Object.assign({}, existingSocket)
    socket.version = '0.0.100'

    run('get', {args: socket, meta})
      .then(response => {
        assert.propertyVal(response.data, 'message', 'No such socket!')
        assert.propertyVal(response, 'code', 404)
        done()
      })
  })

  it('non-existing socket', function (done) {
    run('get', {args: nonExistingSocket, meta})
      .then(response => {
        // assert.propertyVal(response, 'name', 'openweathermap')
        assert.propertyVal(response, 'code', 404)
        done()
      })
  })
})
