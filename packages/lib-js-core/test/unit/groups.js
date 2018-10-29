import nock from 'nock'
import Server from '../../src'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
chai.should()

describe('Groups', () => {
  const instanceName = 'testInstance'
  const groupName = "testGroup"
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
      const list = await groups.list()
      list.should.be.a('array')
    })
  })

  describe('#create', () => {
    it('Create group', async () => {
      const group = await groups.create(groupName, 'Test group')

      group.should.be.a('object')
      group.should.have.property('id')
      group.should.have.property('label').equal(groupName)
    })
  })

  describe('#get', () => {
    it('get group', async () => {
      const group = await groups.get(groupName)

      group.should.be.a('object')
      group.should.have.property('id')
      group.should.have.property('label').equal(groupName)
    })
  })

  describe('#addUser', () => {
    it('add user to group', async () => {
      const user = await groups.addUser(groupName, 1)

      user.should.be.a('object')
      user.should.have.property('user')
    })
  })

  describe('#removeUser', () => {
    it('remove user from group', () => {
      groups.removeUser(groupName, 1)
    })
  })

  describe('#delete', () => {
    it('delete group', () => {
      groups.delete(groupName)
    })
  })

  describe('#user', () => {
    it('get user groups', async () => {
      const userGroups = await groups.user(1)

      userGroups.should.be.a('object')
    })
  })
})
