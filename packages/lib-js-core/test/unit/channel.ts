import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as nock from 'nock'
import Server from '../../src'

chai.use(chaiAsPromised)
chai.should()

describe('Channel', () => {
  const instanceName = 'testInstance'
  let api
  let channel

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
        .post(`/v2/instances/${instanceName}/channels/default/publish/`, {
          room: 'add_user',
          payload: {
            name: 'John'
          }
        })
        .matchHeader('x-api-key', 'testKey')
        .reply(200)

      return channel.publish('add_user', {name: 'John'}).should.be.fulfilled
    })
  })
})
