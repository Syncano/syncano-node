import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as nock from 'nock'
import Server from '../../src'
import {Class} from '../../src/class'

chai.use(chaiAsPromised)
chai.should()

describe('Class', () => {
  const instanceName = 'testInstance'
  let api: nock.Scope
  // tslint:disable-next-line:variable-name
  let _class: Class

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

  describe('#get', () => {
    it('should return single class details', () => {
      api.get(`/v3/instances/${instanceName}/classes/posts/`).reply(200, {name: 'posts'})

      return expect(_class.get('posts')).resolves.toMatchSnapshot()
    })
  })

  describe('#list', () => {
    it('should return list of syncano classes', () => {
      api
        .get(`/v3/instances/${instanceName}/classes/`)
        .reply(200, {objects: [{name: 'posts'}, {name: 'comments'}]})

      return expect(_class.list()).resolves.toMatchSnapshot()
    })
  })
})
