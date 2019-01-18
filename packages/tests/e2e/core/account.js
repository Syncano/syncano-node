/* global describe it beforeAll */
import {expect} from 'chai'
import Server from '../../../lib-js-core/lib'

describe('Account', function () {
  let account = null

  beforeAll(function () {
    account = new Server().account
  })

  it("can't get account with dummy key", function (done) {
    account
      .get('dummy key')
      .then(() => {
        done(new Error("Surprise! I'm in!"))
      })
      .catch(err => {
        expect(err.response.status).to.be.equal(403)
        done()
      })
  })

  it('can get account details with valid key', function (done) {
    account
      .get(process.env.E2E_ACCOUNT_KEY)
      .then(account => {
        expect(account.id).to.be.a('number')
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
