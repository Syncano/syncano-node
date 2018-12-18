/* global it describe before after */
import {expect} from 'chai'
import {
  getRandomString,
  uniqueInstance,
  deleteInstance,
  createInstance
} from '@syncano/test-tools'

import Server from '../../../lib-js-core/lib'

describe('Event', function () {
  let event = null
  const testEventName = getRandomString()
  const testSocketName = getRandomString()
  const instanceName = uniqueInstance()

  const ctx = {
    meta: {
      socket: 'test-socket',
      token: process.env.E2E_ACCOUNT_KEY
    }
  }

  before(function (done) {
    createInstance(instanceName)
      .then(instanceObj => {
        ctx.meta.instance = instanceObj.name
        event = new Server(ctx).event
        done()
      })
      .catch(err => {
        console.log(err)
        err.response.text().then(text => {
          console.log(text)
          done(err)
        })
      })
  })

  after(function (done) {
    deleteInstance(instanceName)
      .then(() => {
        done()
      })
      .catch(() => {
        done()
      })
  })

  it('can emit event with socket name', function (done) {
    event
      .emit(`${testSocketName}.${testEventName}`, {dummyKey: 'dummy_value'})
      .then(event => {
        expect(event).to.be.an('undefined')
        done()
      })
      .catch(err => {
        console.log(err)
        done(err)
      })
  })

  it('can emit event without socket', function (done) {
    event
      .emit(testEventName, {dummyKey: 'dummy_value'})
      .then(event => {
        expect(event).to.be.an('undefined')
        done()
      })
      .catch(err => {
        console.log(err)
        done(err)
      })
  })
})
