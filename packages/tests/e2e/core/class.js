/* global it describe beforeAll afterAll */
import {expect} from 'chai'
import Server from '../../../lib-js-core/lib'

import {
  uniqueInstance,
  getRandomString,
  deleteInstance,
  createInstance
} from '@syncano/test-tools'

describe('Class', function () {
  let _class = null
  const testClassName = getRandomString()
  const instanceName = uniqueInstance()

  beforeAll(function (done) {
    const ctx = {
      meta: {
        socket: 'test-socket',
        token: process.env.E2E_ACCOUNT_KEY
      }
    }
    createInstance(instanceName)
      .then(instanceObj => {
        ctx.meta.instance = instanceObj.name
        _class = new Server(ctx)._class
        done()
      })
      .catch(err => {
        console.log(err)
        done(err)
      })
  })

  afterAll(function (done) {
    deleteInstance(instanceName)
      .then(() => {
        done()
      })
      .catch(() => {
        done()
      })
  })

  it('can create a class', function (done) {
    _class
      .create({
        name: testClassName,
        schema: [{type: 'string', name: 'parameter_name'}]
      })
      .then(res => {
        expect(res.name).to.be.equal(testClassName)
        done()
      })
      .catch(err => {
        console.log(err)
        done(err)
      })
  })

  it('can delete a class', function (done) {
    _class
      .delete(testClassName)
      .then(classObj => {
        expect(classObj).to.be.an('undefined')
        done()
      })
      .catch(err => {
        console.log(err)
        done(err)
      })
  })
})
