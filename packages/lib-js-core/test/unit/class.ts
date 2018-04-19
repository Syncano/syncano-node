import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import nock from 'nock'
import Server from '../../src'

chai.use(chaiAsPromised)
chai.should()

describe('Class', () => {
  const instanceName = 'testInstance'
  let api
  // tslint:disable-next-line:variable-name
  let _class

  beforeEach(() => {
    const server = new Server({
      token: 'testKey',
      instanceName
    })
    _class = server._class
    api = nock(`https://${process.env.SYNCANO_HOST || 'api.syncano.io'}`)
  })

  describe('#create', () => {
    it('should create syncano class', () => {
      api
        .post(`/v2/instances/${instanceName}/classes/`, {
          name: 'posts'
        })
        .reply(200)

      return _class.create({name: 'posts'}).should.be.fulfilled
    })
  })

  describe('#delete', () => {
    it('should delete syncano class', () => {
      api.delete(`/v2/instances/${instanceName}/classes/posts/`).reply(200)

      return _class.delete('posts').should.be.fulfilled
    })
  })
})
