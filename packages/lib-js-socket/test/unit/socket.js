import nock from 'nock'
import Server from '../../src'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
chai.should()

describe('Socket', () => {
  const instanceName = 'testInstance'
  let api
  let socket

  beforeEach(() => {
    const server = new Server({
      token: 'testKey',
      instanceName
    })
    socket = server.socket
    api = nock(`https://${instanceName}.syncano.space`)
  })

  describe('#post', () => {
    it('should send POST request', () => {
      api.post(`/socket/endpoint/`, {name: 'John'}).reply(200)

      return socket.post('socket/endpoint', {name: 'John'}).should.be.fulfilled
    })
  })

  describe('#get', () => {
    it('should send GET request', () => {
      api.post(`/socket/endpoint/`, {name: 'John', _method: 'GET'}).reply(200)

      return socket.get('socket/endpoint', {name: 'John'}).should.be.fulfilled
    })

    it('should be able to parse plain text response', () => {
      api
        .post(`/socket/endpoint/`, {name: 'John', _method: 'GET'})
        .reply(200, `Hello world`, {
          'Content-Type': 'text/plain'
        })

      return socket.get('socket/endpoint', {name: 'John'}).should.be.fulfilled
    })

    it.skip('should be able to parse buffer response')
  })

  describe('#put', () => {
    it('should send PUT request', () => {
      api.post(`/socket/endpoint/`, {name: 'John', _method: 'PUT'}).reply(200)

      return socket.put('socket/endpoint', {name: 'John'}).should.be.fulfilled
    })
  })

  describe('#patch', () => {
    it('should send PATCH request', () => {
      api.post(`/socket/endpoint/`, {name: 'John', _method: 'PATCH'}).reply(200)

      return socket.patch('socket/endpoint', {name: 'John'}).should.be.fulfilled
    })
  })

  describe('#delete', () => {
    it('should send DELETE request', () => {
      api
        .post(`/socket/endpoint/`, {name: 'John', _method: 'DELETE'})
        .reply(200)

      return socket.delete('socket/endpoint', {name: 'John'}).should.be
        .fulfilled
    })
  })
})
