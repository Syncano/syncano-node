import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as nock from 'nock'
import Server from '../../src'
import {UserClass} from '../../src/user'

chai.use(chaiAsPromised)
chai.should()

describe('User', () => {
  const instanceName = 'testInstance'
  let api: nock.Scope
  let users: UserClass

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
        .get(`/v3/instances/${instanceName}/users/`)
        .query({
          page_size: 500
        })
        .reply(200, {objects: [{id: 1}, {id: 2}]})

      return users.list().should.become([{id: 1}, {id: 2}])
    })
  })
})
