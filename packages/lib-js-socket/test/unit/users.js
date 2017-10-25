import nock from 'nock'
import Server from '../../src'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

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
    api = nock('https://api.syncano.rocks')
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
