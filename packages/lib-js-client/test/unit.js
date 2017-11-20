const jsdom = require('mocha-jsdom')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const axios = require('axios')
const MockAdapter = require('axios-mock-adapter')
const SyncanoClient = require('../src')

const axiosMock = new MockAdapter(axios)

chai.use(chaiAsPromised)

const {assert} = chai

describe('Syncano client units', () => {
  const instanceName = 'test-instance'
  const instanceApiKey = 'test-api-key'
  let client
  let url

  jsdom()

  beforeEach(() => {
    client = new SyncanoClient(instanceName, {
      token: instanceApiKey
    })

    url = client.url.bind(client)
  })

  describe('has property:', () => {
    it('instanceName', () => {
      assert.property(client, 'instanceName')
    })

    it('baseUrl', () => {
      assert.property(client, 'baseUrl')
    })

    it('token', () => {
      assert.property(client, 'token')
    })

    it('setTokenCallback', () => {
      assert.property(client, 'setTokenCallback')
    })
  })

  describe('client', () => {
    it('throws error if endpoint was not passed', () => {
      assert.throws(() => client(), /endpoint parameter is required/)
    })

    it('returns promise', () => {
      const expected = {hello: 'world'}

      axiosMock.onPost(url('users')).reply(200, expected)

      assert.instanceOf(client.get('users'), Promise)
    })

    it('resolves with valid output', () => {
      const expected = {hello: 'world'}

      axiosMock.onPost(url('users')).reply(200, expected)

      return client.get('users').then(response => {
        assert.deepEqual(response, expected)
      })
    })
  })

  describe('#url', () => {
    it('exists in client instance', () => {
      assert.property(client, 'url')
    })

    it('returns valid url', () => {
      const expected = `https://test-instance.syncano.space/users/?_user_key=${instanceApiKey}`

      assert.equal(url('users'), expected)
    })
  })

  describe('#setToken', () => {
    it('exists in client instance', () => {
      assert.property(client, 'setToken')
    })

    it('changes client token', () => {
      const expected = 'new-api-key'

      client.setToken(expected)

      assert.equal(client.token, expected)
    })
  })

  describe('#logout', () => {
    it('exists in client instance', () => {
      assert.property(client, 'logout')
    })

    it('removes client token', () => {
      client.logout()

      assert.equal(client.token, undefined)
    })
  })

  describe('#get', () => {
    it('exists in client instance', () => {
      assert.property(client, 'get')
    })

    it('throws error if endpoint was not passed', () => {
      assert.throws(() => client.get(), /endpoint parameter is required/)
    })

    it('returns promise', () => {
      axiosMock.onPost(url('posts')).reply(200)

      assert.instanceOf(client.get('posts'), Promise)
    })

    it('resolves with valid output', () => {
      const expected = {hello: 'world'}

      axiosMock.onPost(url('users')).reply(200, expected)

      return client.get('users').then(response => {
        assert.deepEqual(response, expected)
      })
    })
  })

  describe('#post', () => {
    it('exists in client instance', () => {
      assert.property(client, 'post')
    })

    it('throws error if endpoint was not passed', () => {
      assert.throws(() => client.post(), /endpoint parameter is required/)
    })

    it('returns promise', () => {
      assert.instanceOf(client.post('users'), Promise)
    })

    it('resolves with valid output', () => {
      const expected = {hello: 'world'}

      axiosMock.onPost(url('users')).reply(200, expected)

      return client.get('users').then(response => {
        assert.deepEqual(response, expected)
      })
    })
  })

  describe('#delete', () => {
    it('exists in client instance', () => {
      assert.property(client, 'delete')
    })

    it('throws error if endpoint was not passed', () => {
      assert.throws(() => client.delete(), /endpoint parameter is required/)
    })

    it('returns promise', () => {
      assert.instanceOf(client.delete('users'), Promise)
    })

    it('resolves with valid output', () => {
      const expected = {hello: 'world'}

      axiosMock.onPost(url('users')).reply(200, expected)

      return client.get('users').then(response => {
        assert.deepEqual(response, expected)
      })
    })
  })

  describe('#put', () => {
    it('exists in client instance', () => {
      assert.property(client, 'put')
    })

    it('throws error if endpoint was not passed', () => {
      assert.throws(() => client.put(), /endpoint parameter is required/)
    })

    it('returns promise', () => {
      assert.instanceOf(client.put('users'), Promise)
    })

    it('resolves with valid output', () => {
      const expected = {hello: 'world'}

      axiosMock.onPost(url('tags')).reply(200, expected)

      return client.get('tags').then(response => {
        assert.deepEqual(response, expected)
      })
    })
  })

  describe('#patch', () => {
    it('exists in client instance', () => {
      assert.property(client, 'patch')
    })

    it('throws error if endpoint was not passed', () => {
      assert.throws(() => client.patch(), /endpoint parameter is required/)
    })

    it('returns promise', () => {
      assert.instanceOf(client.patch('users'), Promise)
    })

    it('resolves with valid output', () => {
      const expected = {hello: 'world'}

      axiosMock.onPost(url('users')).reply(200, expected)

      return client.get('users').then(response => {
        assert.deepEqual(response, expected)
      })
    })
  })

  describe('#subscribe', () => {
    it('exists in client instance', () => {
      assert.property(client, 'subscribe')
    })

    it('throws error if endpoint was not passed', () => {
      assert.throws(() => client.subscribe(), /endpoint parameter is required/)
    })

    it('returns object', () => {
      axiosMock
        .onGet(url('example-socket/example-endpoint/history', {}))
        .reply(200, {objects: [{id: 100}]})

      axiosMock.onGet(url('example-socket/example-endpoint/?')).reply(200)

      assert.instanceOf(
        client.subscribe('example-socket/example-endpoint', () => {}),
        Object
      )
    })
  })

  describe('#setLastId', () => {
    it('exists in client instance', () => {
      assert.property(client, 'setLastId')
    })

    it('returns undefined if data.last_id param is present', () => {
      const data = {
        token: 'myLittleToken',
        // eslint-disable-next-line camelcase
        last_id: 666
      }

      assert(client.setLastId('chat/message', data) === undefined)
    })

    it('returns a Promise if data.last_id param is not present', () => {
      const data = {token: 'myLittleToken'}
      const response = {
        objects: [{id: 42}]
      }

      axiosMock.onGet(url('chat/message/history', data)).reply(200, response)

      assert.instanceOf(client.setLastId('chat/message', data), Promise)
    })

    it('resolves with a valid output', () => {
      const expected = 42
      const data = {token: 'myLittleToken'}
      const response = {
        objects: [{id: 42}]
      }

      axiosMock.onGet(url('chat/message/history', data)).reply(200, response)

      return assert.eventually.equal(
        client.setLastId('chat/message', data),
        expected
      )
    })
  })
})
