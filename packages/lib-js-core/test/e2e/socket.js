import {getRandomString, createTestInstance, deleteTestInstance} from '../utils'

describe('Socket', function () {
  const instanceName = getRandomString()

  before(function (done) {
    createTestInstance(instanceName)
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
    deleteTestInstance(instanceName).then(() => {
      done()
    })
  })

  // TODO: add tests!
})
