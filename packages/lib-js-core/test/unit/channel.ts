import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as nock from 'nock'
import Server from '../../src'
import {Channel} from '../../src/channel'

chai.use(chaiAsPromised)
chai.should()

describe('Channel', () => {
  const instanceName = 'testInstance'
  let api: nock.Scope
  let channel: Channel

  beforeEach(() => {
    const server = new Server({
      token: 'testKey',
      instanceName
    })
    channel = server.channel
    api = nock(`https://${process.env.SYNCANO_HOST || 'api.syncano.io'}`)
  })

  describe('#publish', () => {
    it('should be able to publish new event', () => {
      api
        .matchHeader('x-api-key', 'testKey')
        .post(`/v2/instances/${instanceName}/channels/default/publish/`, {
          room: 'add_user',
          payload: {
            name: 'John'
          }
        })
        .reply(200)

      return channel.publish('add_user', {name: 'John'}).should.be.fulfilled
    })
  })
})
