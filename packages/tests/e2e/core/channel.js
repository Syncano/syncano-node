/* global it describe before after */
import fs from 'fs'
import {join} from 'path'
import FormData from 'form-data'
import fetch from 'node-fetch'
import chai, {expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'

import Server from '../../../lib-js-core/src'
import {parseJSON, checkStatus} from '../../../lib-js-core/src/utils'

import {
  getRandomString,
  deleteInstance,
  createInstance
} from '@syncano/test-tools'

chai.use(chaiAsPromised)
chai.should()

describe.skip('Channel', function () {
  const instanceName = getRandomString()
  const {channel} = new Server({
    instanceName
  })

  before(() =>
    createInstance(instanceName)
      .then(uploadEnvironment)
      .then(uploadSocket)
      .then(waitForSocket)
  )

  after(() => deleteInstance(instanceName))

  describe('#publish()', () => {
    it('can publish to channel', () =>
      channel
        .publish('messages')
        .should.eventually.have.property('room', 'messages'))

    it('should send message to listener through channel', done => {
      fetch(
        `https://${instanceName}.${process.env
          .SYNCANO_SPACE_HOST}/syncano-server-test-socket/messages/`,
        {
          method: 'GET'
        }
      )
        .then(parseJSON)
        .then(checkStatus)
        .then(res => {
          expect(res).to.have.nested.property('payload.content', 'Hello world')
          done()
        })
        .catch(err => {
          console.log(err)
          done(err)
        })

      setTimeout(() => {
        channel.publish('messages', {content: 'Hello world'})
      }, 100)
    })
  })

  function uploadSocket () {
    const socket = new FormData()

    return new Promise((resolve, reject) => {
      socket.append('name', 'syncano-server-test-socket')
      socket.append('environment', 'syncano-server-test-socket')
      socket.append(
        'zip_file',
        fs.createReadStream(join(__dirname, '/assets/socket/socket.zip'))
      )
      socket.submit(
        {
          method: 'POST',
          protocol: 'https:',
          host: process.env.SYNCANO_HOST,
          headers: {'X-Api-Key': process.env.E2E_ACCOUNT_KEY},
          path: `/v2/instances/${instanceName}/sockets/`
        },
        (err, res) => {
          if (res.statusCode === 200) {
            resolve()
          }

          res.on('data', data => {
            const message = data.toString()

            if (err || res.statusCode === 404) return reject(err || res)
            if (res.statusCode > 299) return reject(message)

            resolve(message)
          })
        }
      )
    })
  }

  function uploadEnvironment () {
    const env = new FormData()

    return new Promise((resolve, reject) => {
      env.append('name', 'syncano-server-test-socket')
      env.append(
        'zip_file',
        fs.createReadStream(join(__dirname, '/assets/socket/node_modules.zip'))
      )
      env.submit(
        {
          method: 'POST',
          protocol: 'https:',
          host: process.env.SYNCANO_HOST,
          headers: {'X-Api-Key': process.env.E2E_ACCOUNT_KEY},
          path: `/v2/instances/${instanceName}/environments/`
        },
        (err, res) => {
          if (res.statusCode === 200) {
            resolve()
          }

          res.on('data', data => {
            const message = data.toString()

            if (err || res.statusCode === 404) return reject(err || res)
            if (res.statusCode > 299) return reject(message)

            resolve(message)
          })
        }
      )
    })
  }

  function waitForSocket () {
    return new Promise(resolve => {
      const getStatus = () => {
        fetch(
          `https://${process.env
            .SYNCANO_HOST}/v2/instances/${instanceName}/sockets/syncano-server-test-socket/`,
          {
            method: 'GET',
            headers: {'X-Api-Key': process.env.E2E_ACCOUNT_KEY}
          }
        )
          .then(parseJSON)
          .then(checkStatus)
          .then(res => {
            if (res.status !== 'ok' && res.status !== 'error') {
              setTimeout(getStatus, 200)
            } else {
              resolve()
            }
          })
      }
      getStatus()
    })
  }
})
