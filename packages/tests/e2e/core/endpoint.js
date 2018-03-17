/* global describe before after */
import {
  uniqueInstance,
  deleteInstance,
  createInstance
} from '@syncano/test-tools'

describe('Endpoint', function () {
  const instanceName = uniqueInstance()

  before(function (done) {
    createInstance(instanceName)
      .then(instanceObj => {
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
    deleteInstance(instanceName).then(() => {
      done()
    })
  })

  // TODO: add tests!
})
