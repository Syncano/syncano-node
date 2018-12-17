import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as nock from 'nock'
import Server from '../../src'
import Backup from '../../src/backup'

chai.use(chaiAsPromised)
chai.should()

describe('Backup', () => {
  const instanceName = 'testInstance'
  const BACKUPS_URL = `/v2/instances/${instanceName}/backups/full/`
  const BACKUP = {
    id: 703,
    instance: instanceName,
    created_at: '2018-11-13T10:29:32.598102Z',
    updated_at: '2018-11-13T10:29:32.598126Z',
    size: null,
    status: 'success',
    status_info: '',
    description: '',
    label: '',
    author:
     { id: 3124,
       email: 'test@user.com',
       first_name: '',
       last_name: '',
       is_active: false,
       has_password: true,
       metadata: {} },
    details: {},
    metadata: {},
    links: {self: '/v2/backups/full/703/'}
  }
  let api: nock.Scope
  let backup: Backup

  beforeEach(() => {
    const server = new Server({
      token: 'testKey',
      accountKey: 'testKey',
      instanceName
    })
    backup = server.backups
    api = nock(`https://${process.env.SYNCANO_HOST || 'api.syncano.io'}`)
  })

  describe('#list', () => {
    it('should return list of 2 backups', () => {
      api.get(BACKUPS_URL).reply(200, {
        next: null,
        prev: null,
        objects: [BACKUP, BACKUP]
      })

      return expect(backup.list()).resolves.toMatchSnapshot()
    })
  })

  describe('#create', () => {
    it('should create and return backup', () => {
      api.post(BACKUPS_URL).reply(200, BACKUP)

      return expect(backup.create()).resolves.toMatchSnapshot()
    })
  })

  describe('#delete', () => {
    it('should delete backup and return undefined', () => {
      api.delete(`${BACKUPS_URL}${BACKUP.id}/`).reply(204)

      return expect(backup.delete(BACKUP.id)).resolves.toMatchSnapshot()
    })

    it('should throw error when backup was not found', () => {
      api.delete(`${BACKUPS_URL}${BACKUP.id}/`).reply(404)

      return expect(backup.delete(BACKUP.id)).rejects.toMatchSnapshot()
    })

    it('should delete list of backups and return list of booleans', () => {
      const BACKUP_1 = {...BACKUP, id: 700}
      const BACKUP_2 = {...BACKUP, id: 701}
      const BACKUP_3 = {...BACKUP, id: 703}

      api
        .delete(`${BACKUPS_URL}${BACKUP_1.id}/`).reply(200)
        .delete(`${BACKUPS_URL}${BACKUP_2.id}/`).reply(404)
        .delete(`${BACKUPS_URL}${BACKUP_3.id}/`).reply(200)

      return expect(backup.delete([BACKUP_1.id, BACKUP_2.id, BACKUP_3.id])).resolves.toMatchSnapshot()
    })

    it('should delete all backups and return list of booleans', () => {
      const BACKUP_1 = {...BACKUP, id: 700}
      const BACKUP_2 = {...BACKUP, id: 701}
      const BACKUP_3 = {...BACKUP, id: 703}
      api
        .get(BACKUPS_URL).reply(200, {
          next: null,
          prev: null,
          objects: [BACKUP_1, BACKUP_2, BACKUP_3]
        })
        .delete(`${BACKUPS_URL}${BACKUP_1.id}/`).reply(200)
        .delete(`${BACKUPS_URL}${BACKUP_2.id}/`).reply(200)
        .delete(`${BACKUPS_URL}${BACKUP_3.id}/`).reply(200)

      return expect(backup.delete([BACKUP_1.id, BACKUP_2.id, BACKUP_3.id])).resolves.toMatchSnapshot()
    })
  })

  describe('#find', () => {
    it('should find single backup by id ', async () => {
      api.get(`${BACKUPS_URL}703/`).reply(200, BACKUP)

      const group = await backup.find(BACKUP.id)

      expect(group).toMatchSnapshot()
    })
  })

  describe('#findMany', () => {
    const BACKUP_1 = {...BACKUP, id: 700}
    const BACKUP_2 = {...BACKUP, id: 701}

    it('should find many backups by id ', async () => {
      api
        .get(BACKUPS_URL).reply(200, {
          next: null,
          prev: null,
          objects: [BACKUP_1, BACKUP_2]
        })

      const res = await backup.findMany([BACKUP_1.id, BACKUP_2.id])

      expect(res).toHaveLength(2)
      expect(res).toMatchSnapshot()
    })
  })

  describe('#findOrFail', () => {
    it('should return single backup by id ', () => {
      api.get(`${BACKUPS_URL}${BACKUP.id}/`).reply(200, BACKUP)

      return expect(backup.findOrFail(BACKUP.id)).resolves.toMatchSnapshot()
    })

    it('should throw error when backup was not found ', () => {
      api.get(`${BACKUPS_URL}600/`).reply(404)

      return expect(backup.findOrFail(600)).rejects.toMatchSnapshot()
    })
  })

  describe('#last', () => {
    it('should return last backup', () => {
      api.get(BACKUPS_URL).reply(200, {
        next: null,
        prev: null,
        objects: [BACKUP, BACKUP]
      })

      return expect(backup.last()).resolves.toMatchSnapshot()
    })
  })
})
