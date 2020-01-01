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
      const response = {name: 'my-insta'}

      api.post(`/v2/instances/`, response).reply(200, response)

      return expect(instance.create(response)).resolves.toMatchSnapshot()
    })
  })

  describe('#list', () => {
    it('should list syncano instances', () => {
      api.get(`/v3/instances/`).reply(200, {
        objects: [
          {
            name: 'instance1'
          },
          {
            name: 'instance2'
          }
        ] as Instance[],
        next: null,
        prev: null
      })

      return expect(instance.list()).resolves.toMatchSnapshot()
    })
  })

  describe('#delete', () => {
    it('should delete syncano instance', () => {
      api.delete(`/v2/instances/my-insta/`).reply(200)

      return instance.delete('my-insta').should.be.fulfilled
    })
  })
})
