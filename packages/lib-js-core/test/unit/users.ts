/* global it describe beforeEach */
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import nock from 'nock'
import Server from '../../src'

chai.use(chaiAsPromised)
chai.should()

describe('Users', () => {
  const instanceName = 'testInstance'
  let api
  let users

  beforeEach(() => {
    const server = new Server({
      token: 'testKey',
      instanceName
    })
    users = server.users
    api = nock(`https://${process.env.SYNCANO_HOST || 'api.syncano.io'}`)
  })

  describe('#list', () => {
    it('should list users', () => {
      api
        .get(`/v2/instances/${instanceName}/users/`)
        .reply(200, {objects: [{id: 1}, {id: 2}]})

      return users.list().should.become([{id: 1}, {id: 2}])
    })
  })
})
