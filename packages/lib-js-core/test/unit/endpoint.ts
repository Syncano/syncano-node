import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as nock from 'nock'
import Server from '../../src'

chai.use(chaiAsPromised)
chai.should()

describe('Endpoint', () => {
  const instanceName = 'testInstance'
  let api
  let endpoint

  beforeEach(() => {
    const server = new Server({
      token: 'testKey',
      instanceName
    })
    endpoint = server.endpoint
    api = nock(`https://${instanceName}.syncano.space`)
  })

  describe('#post', () => {
    it('should send POST request', () => {
      api.post(`/socket/endpoint/`, {name: 'John'}).reply(200)

      return endpoint.post('socket/endpoint', {name: 'John'}).should.be.fulfilled
    })
  })

  describe('#get', () => {
    it('should send GET request', () => {
      api.post(`/socket/endpoint/`, {name: 'John', _method: 'GET'}).reply(200)

      return endpoint.get('socket/endpoint', {name: 'John'}).should.be.fulfilled
    })

    it('should be able to parse plain text response', () => {
      api
        .post(`/socket/endpoint/`, {name: 'John', _method: 'GET'})
        .reply(200, `Hello world`, {
          'Content-Type': 'text/plain'
        })

      return endpoint.get('socket/endpoint', {name: 'John'}).should.be.fulfilled
    })

    it.skip('should be able to parse buffer response', () => null)
  })

  describe('#put', () => {
    it('should send PUT request', () => {
      api.post(`/socket/endpoint/`, {name: 'John', _method: 'PUT'}).reply(200)

      return endpoint.put('socket/endpoint', {name: 'John'}).should.be.fulfilled
    })
  })

  describe('#patch', () => {
    it('should send PATCH request', () => {
      api.post(`/socket/endpoint/`, {name: 'John', _method: 'PATCH'}).reply(200)

      return endpoint.patch('socket/endpoint', {name: 'John'}).should.be.fulfilled
    })
  })

  describe('#delete', () => {
    it('should send DELETE request', () => {
      api
        .post(`/socket/endpoint/`, {name: 'John', _method: 'DELETE'})
        .reply(200)

      return endpoint.delete('socket/endpoint', {name: 'John'}).should.be
        .fulfilled
    })
  })
})
