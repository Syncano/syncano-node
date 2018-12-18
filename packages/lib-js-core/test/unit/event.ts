import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as nock from 'nock'
import * as should from 'should'
import Server from '../../src'
import {EventClass} from '../../src/event'
import {getRandomString} from '../utils'

chai.use(chaiAsPromised)
chai.should()

describe('Event', () => {
  const instanceName = 'testInstance'
  let api: nock.Scope
  let event: EventClass

  beforeEach(() => {
    const server = new Server({
      token: 'testKey',
      instanceName,
      socket: 'test_socket'
    })
    event = server.event
    api = nock(`https://${process.env.SYNCANO_HOST || 'api.syncano.io'}`)
  })

  describe('#emit', () => {
    it('should be able to emit event with custom socket name', () => {
      api
        .post(`/v2/instances/${instanceName}/triggers/emit/`, {
          signal: 'socket_name.email_sent'
        })
        .reply(200)

      return event.emit('socket_name.email_sent')
    })

    it('should be able to emit event with environment socket name', () => {
      api
        .post(`/v2/instances/${instanceName}/triggers/emit/`, {
          signal: 'test_socket.email_sent'
        })
        .reply(200)

      return event.emit('email_sent')
    })
  })

  describe('splitSignal', () => {
    const socketName = getRandomString()
    const signalName = getRandomString()

    it('splitSignal properly spliting signalString with socket', () => {
      const {socket, signal} = EventClass.splitSignal(`${socketName}.${signalName}`)
      should(socket).be.equal(socketName)
      should(signal).be.equal(signalName)
    })

    it('splitSignal properly spliting signalString without socket', () => {
      const {socket, signal} = EventClass.splitSignal(`${signalName}`)
      should(socket).be.undefined()
      should(signal).be.equal(signalName)
    })
  })
})
