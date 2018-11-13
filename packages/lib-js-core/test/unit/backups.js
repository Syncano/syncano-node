import nock from 'nock'
import Server from '../../src'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
chai.should()

describe('Backups', () => {
  const instanceName = 'testInstance'
  const BACKUPS_URL = `/v2/instances/${instanceName}/backups/full/`
  const backup = {
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
    links: { self: '/v2/backups/full/703/' }
  }
  let api
  let Backups

  beforeEach(() => {
    const server = new Server({
      token: 'testKey',
      instanceName
    })
    Backups = server.backups
    api = nock(`https://${process.env.SYNCANO_HOST || 'api.syncano.io'}`)
  })

  describe('#list', () => {
    it('Get backups list', async () => {
      api.get(BACKUPS_URL).reply(200, {
        next: null,
        prev: null,
        objects: [backup, backup]
      })

      const data = await Backups.list()

      data.should.be.a('array')
      data.should.have.lengthOf(2)
    })
  })

  describe('#create', () => {
    it('Create backup', async () => {
      api.post(BACKUPS_URL).reply(200, backup)

      const data = await Backups.create()

      data.should.be.a('object')
      data.should.have.property('id')
      data.should.have.property('instance')
      data.should.have.property('author')
      data.should.have.property('status')
    })
  })

  describe('#get', () => {
    it('Get backups list', async () => {
      api.get(`${BACKUPS_URL}703/`).reply(200, backup)
      const data = await Backups.get(703)

      data.should.be.a('object')
      data.should.have.property('id').equal(703)
      data.should.have.property('instance')
      data.should.have.property('author')
      data.should.have.property('status')
    })
  })
})


