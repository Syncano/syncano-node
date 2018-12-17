import nock from 'nock'
import Server from '../../src'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
chai.should()

describe('Groups', () => {
  const instanceName = 'testInstance'
  const user = {
    id: 1,
    username: 'testUser'
  }
  const testGroup = {
    id: 1,
    label: 'testGroup',
    description: ''
  }
  const GROUPS_URL = `/v2/instances/${instanceName}/groups/`
  const USER_GROUPS_URL = `/v2/instances/${instanceName}/users/${user.id}/groups/`
  let api
  let groups

  beforeEach(() => {
    const server = new Server({
      token: 'testKey',
      instanceName
    })
    groups = server.groups
    api = nock(`https://${process.env.SYNCANO_HOST || 'api.syncano.io'}`)
  })

  describe('#list', () => {
    it('get list of groups', async () => {
      api.get(GROUPS_URL).reply(200, {next: null, objects: ['admin', 'mod']})

      const list = await groups.list()

      list.should.be.a('array')
      list.should.have.lengthOf(2)
    })
  })

  describe('#get', () => {
    it('get group', async () => {
      api.get(`${GROUPS_URL}1/users/`).reply(200, {objects: []})
      api.get(GROUPS_URL).reply(200, {
        next: null,
        objects: [testGroup]
      })

      const group = await groups.get(testGroup.label)

      group.should.have.property('id')
      group.should.have.property('label').equal(testGroup.label)
      group.should.have.property('users')
    })
  })

  describe('#create', () => {
    it('create group', async () => {
      api.get(GROUPS_URL).reply(200, {next: null, objects: []})
      api.post(GROUPS_URL, body => {
        return body.label && body.description
      }).reply(200, (url, {label, description}) => ({
        id: 1,
        label,
        description
      }))

      const group = await groups.create(testGroup.label, 'Test group')

      group.should.be.a('object')
      group.should.have.property('id')
      group.should.have.property('label').equal(testGroup.label)
    })
  })

  describe('#delete', () => {
    it('delete group', () => {
      api.delete(`${GROUPS_URL}1/`).reply(200)
      api.get(`${GROUPS_URL}1/users/`).reply(200, {objects: []})
      api.get(GROUPS_URL).reply(200, {
        next: null,
        objects: [testGroup]
      })

      groups.delete(testGroup.label)
    })
  })

  describe('#user', () => {
    it('get user groups', async () => {
      api.get(USER_GROUPS_URL).reply(200, {
        objects: [testGroup]
      })
      const userGroups = await groups.user(1)

      userGroups.should.be.a('array')
    })
  })

  describe('#addUser', () => {
    it('add user to group', async () => {
      api.get(`${GROUPS_URL}1/users/`).reply(200, {objects: []})
      api.get(GROUPS_URL).reply(200, {
        next: null,
        objects: [testGroup]
      })
      api.post(`${GROUPS_URL}1/users/`, body => body.user).reply(200, {
        user: {
          id: 1,
          username: 'user'
        }
      })

      const user = await groups.addUser(testGroup.label, 1)

      user.should.have.property('user')
    })
  })

  describe('#removeUser', () => {
    it('remove user from group', () => {
      api.delete(`${GROUPS_URL}1/users/1/`).reply(200)
      api.get(`${GROUPS_URL}1/users/`).reply(200, {objects: []})
      api.get(GROUPS_URL).reply(200, {
        next: null,
        objects: [testGroup]
      })

      groups.removeUser(testGroup.label, 1)
    })
  })
})
