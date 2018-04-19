import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as nock from 'nock'
import Server from '../../src'

chai.use(chaiAsPromised)
chai.should()

describe('Instance', () => {
  const instanceName = 'testInstance'
  let api
  let instance

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

  describe('#delete', () => {
    it('should delete syncano instance', () => {
      api.delete(`/v2/instances/my-insta/`).reply(200)

      return instance.delete('my-insta').should.be.fulfilled
    })
  })
})
