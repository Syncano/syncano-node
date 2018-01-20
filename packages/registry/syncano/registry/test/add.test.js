/* global describe it before */
import {assert} from 'chai'
import faker from 'faker'
import semver from 'semver'
import {run, generateMeta} from '@syncano/test'
import Syncano from '@syncano/core'

run.verifyRequest = false
run.verifyResponse = false

const {generateSocket} = require('./utils').default()

describe('add', function () {
  let firstAccountObj = {
    token: process.env.REGISTRY_E2E_USER_ACCOUNT_KEY_1
  }
  let secondAccountObj = {
    token: process.env.REGISTRY_E2E_USER_ACCOUNT_KEY_2
  }
  const meta = generateMeta('add', {
    request: {
      HTTP_X_SYNCANO_ACCOUNT_KEY: firstAccountObj.token
    }
  })

  // let firstUserOrgName = faker.company.companyName()
  // let secondUserOrgName = faker.company.companyName()
  // const orgDescription = faker.lorem.sentence()

  const firstSocket = generateSocket()
  const secondSocket = generateSocket()

  const {account} = Syncano({meta})

  before(function (done) {
    Promise.all([
      account.get(firstAccountObj.token),
      account.get(secondAccountObj.token)
    ])
      .then(data => {
        const [firstAccountData, secondAccountData] = data
        firstAccountObj = Object.assign(firstAccountObj, firstAccountData)
        secondAccountObj = Object.assign(secondAccountObj, secondAccountData)
        done()
      })
  })

  it('new socket', function (done) {
    run('add', {args: firstSocket, meta})
      .then(response => {
        assert.propertyVal(response.data, 'name', firstSocket.name)
        assert.propertyVal(response, 'code', 200)
        done()
      })
  })

  it('one more version', function (done) {
    const args = Object.assign({}, firstSocket)
    args.version = semver.inc(args.version, 'patch')

    run('add', {args, meta})
      .then(response => {
        assert.propertyVal(response, 'code', 200)
        assert.propertyVal(response.data, 'name', args.name)
        assert.propertyVal(response.data, 'version', args.version)
        done()
      })
  })

  it('one more version with new keyword', function (done) {
    const args = Object.assign({}, firstSocket)

    // I need to bum twice here
    args.version = semver.inc(args.version, 'patch')
    args.version = semver.inc(args.version, 'patch')

    args.keywords.push(faker.random.word())

    run('add', {args, meta})
      .then(response => {
        assert.propertyVal(response, 'code', 200)
        assert.propertyVal(response.data, 'name', args.name)
        assert.propertyVal(response.data, 'version', args.version)
        done()
      })
  })

  it('with wrong version', function (done) {
    const args = Object.assign({}, firstSocket)
    args.version = '0.3' // format incompatible with semver

    run('add', {args, meta})
      .then(response => {
        assert.propertyVal(response, 'code', 400)
        assert.propertyVal(
          response.data,
          'message',
          `Version "${args.version}" has a wrong format! Check http://semver.org/ for more info.`
        )
        done()
      })
  })

  it('socket with the existing version (first socket once again)', function (done) {
    run('add', {args: firstSocket, meta})
      .then(response => {
        assert.propertyVal(response, 'code', 400)
        assert.include(response.data.message, 'Wrong version!')
        done()
      })
  })

  it('new socket as different owner', function (done) {
    const args = Object.assign({}, secondSocket)
    const metaWithSecondUser = Object.assign({}, meta)
    metaWithSecondUser.request.HTTP_X_SYNCANO_ACCOUNT_KEY = process.env.REGISTRY_E2E_USER_ACCOUNT_KEY_2

    run('add', {args, meta: metaWithSecondUser})
      .then(response => {
        assert.propertyVal(response, 'code', 200)
        assert.propertyVal(response.data, 'name', args.name)
        assert.propertyVal(response.data, 'version', args.version)
        done()
      })
  })

  it('new socket with wrong user token', function (done) {
    const args = Object.assign({}, secondSocket)
    args.name = 'wrong_key_socket_name'
    const metaWithSecondUser = Object.assign({}, meta)
    metaWithSecondUser.request.HTTP_X_SYNCANO_ACCOUNT_KEY = 'wrong_key'

    run('add', {args, meta: metaWithSecondUser})
      .then(response => {
        assert.propertyVal(response, 'code', 400)
        assert.propertyVal(response.data, 'message', 'No such API Key.')
        done()
      })
  })

  it('existing socket as different owner', function (done) {
    const args = Object.assign({}, firstSocket)
    const metaWithSecondUser = Object.assign({}, meta)
    metaWithSecondUser.request.HTTP_X_SYNCANO_ACCOUNT_KEY = process.env.REGISTRY_E2E_USER_ACCOUNT_KEY_2

    run('add', {args, meta: metaWithSecondUser})
      .then(response => {
        assert.propertyVal(response, 'code', 400)
        assert.propertyVal(response.data, 'message', 'This socket doesn\'t belong to you!')
        done()
      })
  })
})
