import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as nock from 'nock'
import Server from '../../src'
import {InstanceClass} from '../../src/instance'
import {Instance} from '../../src/types'

chai.use(chaiAsPromised)
chai.should()

describe('Instance', () => {
  const instanceName = 'testInstance'
  let api: nock.Scope
  let instance: InstanceClass

  beforeEach(() => {
    const server = new Server({
      token: 'testKey',
      instanceName
    })
    instance = server.instance
    api = nock(`https://${process.env.SYNCANO_HOST || 'api.syncano.io'}`)
  })

  describe('#create', () => {
    it('should create syncano instance', () => {
      api.post(`/v2/instances/`, {name: 'my-insta'}).reply(200)

      return instance.create({name: 'my-insta'}).should.be.fulfilled
    })
  })

  describe('#list', () => {
    it('should list syncano instances', () => {
      const fakeResp = {
        objects: <Instance[]>[
          {
            name: 'instance1',
          },
          {
            name: 'instance2',
          }
        ],
        next: null,
        prev: null
      }

      api.get(`/v3/instances/`).reply(200, fakeResp)
      instance.list().should.be.fulfilled

      api.get(`/v3/instances/`).reply(200, fakeResp)
      instance.list().should.be.eventually.equal(fakeResp.objects)
    })
  })

  describe('#delete', () => {
    it('should delete syncano instance', () => {
      api.delete(`/v2/instances/my-insta/`).reply(200)

      return instance.delete('my-insta').should.be.fulfilled
    })
  })
})
