import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as nock from 'nock'
import Server from '../../src'
import {GroupClass} from '../../src/group'
import {SyncanoResponse, UserGroup} from '../../src/types'

chai.use(chaiAsPromised)
chai.should()

type ResponseTuple = [number, SyncanoResponse<UserGroup>]

describe('Group', () => {
  const instanceName = 'testInstance'
  let api: nock.Scope
  let groups: GroupClass

  const USER = {
    id: 2,
    username: 'testUser',
    revision: 6,
    user_key: 'xyz',
    created_at: '2018-07-16T16:01:15.736047Z',
    updated_at: '2018-07-31T15:16:31.259745Z'
  }
  const GROUPS_URL_V2 = `/v2/instances/${instanceName}/groups/`
  const USER_GROUPS_URL_V3 = `/v3/instances/${instanceName}/users/${USER.id}/groups/`
  const ADMIN_GROUP: UserGroup = {
    id: 1,
    name: 'admin',
    label: 'Admin',
    description: ''
  }
  const MANAGER_GROUP: UserGroup = {
    id: 2,
    name: 'manager',
    label: 'Manager',
    description: 'Manage stuff'
  }
  const LIST_RESPONSE: ResponseTuple = [200, {
    next: null,
    prev: null,
    objects: [ADMIN_GROUP, MANAGER_GROUP]
  }]

  beforeEach(() => {
    const server = new Server({
      token: 'testKey',
      instanceName
    })
    groups = server.groups
    api = nock(`https://${process.env.SYNCANO_HOST || 'api.syncano.io'}`)
  })

  describe('#find', () => {
    it('should find single group by id ', async () => {
      api.get(GROUPS_URL_V2).reply(...LIST_RESPONSE)

      const group = await groups.find(MANAGER_GROUP.id)

      expect(group).toMatchSnapshot()
    })

    it('should find single group by name', async () => {
      api.get(GROUPS_URL_V2).reply(...LIST_RESPONSE)

      const group = await groups.find(MANAGER_GROUP.name)

      expect(group).toMatchSnapshot()
    })
  })

  describe('#findMany', () => {
    it('should find many groups by id ', async () => {
      api
        .get(GROUPS_URL_V2).reply(...LIST_RESPONSE)
        .get(GROUPS_URL_V2).reply(...LIST_RESPONSE)

      const res = await groups.findMany([ADMIN_GROUP.id, MANAGER_GROUP.id])
      const res2 = await groups.findMany([MANAGER_GROUP.id])

      expect(res).toHaveLength(2)
      expect(res).toMatchSnapshot()
      expect(res2).toHaveLength(1)
      expect(res2).toMatchSnapshot()
    })

    it('should find many groups by name', async () => {
      api
        .get(GROUPS_URL_V2).reply(...LIST_RESPONSE)
        .get(GROUPS_URL_V2).reply(...LIST_RESPONSE)
      const group = await groups.find(MANAGER_GROUP.name)

      expect(group).toMatchSnapshot()
    })
  })

  describe('#list', () => {
    it('should get list of groups', async () => {
      api.get(GROUPS_URL_V2).reply(...LIST_RESPONSE)

      const list = await groups.list()

      expect(list).toMatchSnapshot()
    })
  })

  describe('#create', () => {
    it('should create a group', async () => {
      api.post(GROUPS_URL_V2).reply(200, ADMIN_GROUP)

      const group = await groups.create(ADMIN_GROUP)

      expect(group).toMatchSnapshot()
    })
  })

  describe('#update', () => {
    it('should update a group by id', () => {
      api.patch(`${GROUPS_URL_V2}${MANAGER_GROUP.id}/`).reply(200, ADMIN_GROUP)

      return expect(groups.update(MANAGER_GROUP.id, ADMIN_GROUP)).resolves.toMatchSnapshot()
    })
  })

  describe('#delete', () => {
    it('should delete a group by id', () => {
      api.delete(`${GROUPS_URL_V2}${ADMIN_GROUP.id}/`).reply(200)

      return expect(groups.delete(ADMIN_GROUP.id)).resolves.toMatchSnapshot()
    })
  })

  describe('#attachUser', () => {
    it('should attach user to a group with given id', () => {
      api.post(`${GROUPS_URL_V2}${ADMIN_GROUP.id}/users/`).reply(200, USER)

      return expect(groups.attachUser(ADMIN_GROUP.id, USER.id)).resolves.toMatchSnapshot()
    })

    it('should attach user to a group with given name', () => {
      api.get(GROUPS_URL_V2).reply(...LIST_RESPONSE)
      api.post(`${GROUPS_URL_V2}${ADMIN_GROUP.id}/users/`).reply(200, USER)

      return expect(groups.attachUser(ADMIN_GROUP.name, USER.id)).resolves.toMatchSnapshot()
    })
  })

  describe('#detachUser', () => {
    it('should detach user from a group with given id', () => {
      api.delete(`${GROUPS_URL_V2}${ADMIN_GROUP.id}/users/${USER.id}/`).reply(200)

      return expect(groups.detachUser(ADMIN_GROUP.id, USER.id)).resolves.toMatchSnapshot()
    })

    it('should detach user from a group with given name', () => {
      api.get(GROUPS_URL_V2).reply(...LIST_RESPONSE)
      api.delete(`${GROUPS_URL_V2}${ADMIN_GROUP.id}/users/${USER.id}/`).reply(200)

      return expect(groups.detachUser(ADMIN_GROUP.name, USER.id)).resolves.toMatchSnapshot()
    })
  })

  describe('#isUserAttahcedTo', () => {
    it('should return true when user belongs to a group', () => {
      api.get(USER_GROUPS_URL_V3).reply(...LIST_RESPONSE)

      return expect(groups.isUserAttachedTo(ADMIN_GROUP.id, USER.id)).resolves.toMatchSnapshot()
    })

    it('should return false when user doesn\'t belong to a group', () => {
      api.get(USER_GROUPS_URL_V3).reply(200, {
        next: null,
        prev: null,
        objects: [MANAGER_GROUP]
      })

      return expect(groups.isUserAttachedTo(ADMIN_GROUP.name, USER.id)).resolves.toMatchSnapshot()
    })
  })

  describe('#getUserGroups', () => {
    it('should return list of user groups', () => {
      api.get(USER_GROUPS_URL_V3).reply(...LIST_RESPONSE)

      return expect(groups.getUserGroups(USER.id)).resolves.toMatchSnapshot()
    })
  })
})
