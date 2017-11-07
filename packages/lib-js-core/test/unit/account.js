import nock from 'nock'
import Server from '../../src'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
chai.should()

describe('Account', () => {
  const instanceName = 'testInstance'
  let api
  let account

  beforeEach(() => {
    const server = new Server({
      token: 'testKey',
      instanceName
    })
    account = server.account
    api = nock(`https://${process.env.SYNCANO_HOST || 'api.syncano.io'}`)
  })

  describe('#get', () => {
    it('should fail for invalid account key', () => {
      api
        .get(`/v2/account/`)
        .matchHeader('x-api-key', 'invalid_key')
        .reply(400, {
          detail: 'No such API Key.'
        })

      return account
        .get('invalid_key')
        .should.be.rejectedWith(Error, 'No such API Key.')
    })

    it('should get account with valid account key', () => {
      api
        .get(`/v2/account/`)
        .matchHeader('x-api-key', 'valid_key')
        .reply(200, {
          id: 1
        })

      return account.get('valid_key').should.be.become({
        id: 1
      })
    })
  })
})
