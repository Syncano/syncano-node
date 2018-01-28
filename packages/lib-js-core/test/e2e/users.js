/* globals it describe before after */
import {expect} from 'chai'
import Server from '../../src'
import {getRandomString, createTestInstance, deleteTestInstance} from '../utils'

describe('Users', function () {
  let users
  const instanceName = getRandomString()

  before(function () {
    const server = new Server({
      instanceName,
      meta: {
        api_host: process.env.SYNCANO_HOST,
        socket: 'test-socket',
        token: process.env.E2E_ACCOUNT_KEY
      }
    })
    users = server.users

    return createTestInstance(instanceName)
  })

  after(() => deleteTestInstance(instanceName))

  it('can\'t log in with wrong credentials', async () => {
    const credentials = {
      username: 'someusername',
      password: 'somepassword'
    }
    try {
      await users.login(credentials)
      throw new Error("Surprise! I'm in!")
    } catch (err) {
      expect(err.message).to.be.equal('Invalid username.')
      expect(err.response.status).to.be.equal(401)
    }
  })

  it('can register a user', async () => {
    const credentials = {
      username: 'someusername',
      password: 'somepassword'
    }

    const addedUser = await users.create(credentials)
    expect(addedUser.username).to.be.equal(credentials.username)
    expect(addedUser.user_key).to.exist // eslint-disable-line
  })

  it('can register a user and login', async () => {
    const credentials = {
      username: 'someusername1',
      password: 'somepassword1'
    }

    const addedUser = await users.create(credentials)
    expect(addedUser.username).to.be.equal(credentials.username)
    expect(addedUser.user_key).to.exist // eslint-disable-line

    await users.login(credentials)
  })
})
