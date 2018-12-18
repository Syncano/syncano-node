/* global it describe before after */
import fs from 'fs'
import path from 'path'
import {expect} from 'chai'
import Server from '../../../lib-js-core/lib'

import {projectTestTemplate} from '../utils'

import {
  testsLocation,
  deleteInstance,
  createProject,
  uniqueInstance,
  getRandomString
} from '@syncano/test-tools'

describe('Registry', function () {
  let registry
  const testInstance = uniqueInstance()

  before(async () => {
    await createProject(testInstance, projectTestTemplate)
    registry = new Server({accountKey: process.env.E2E_ACCOUNT_KEY}).registry
  })
  after(async () => deleteInstance(testInstance))

  it('search non-existing Socket by keyword', async () => {
    try {
      await registry.searchSocketsByAll('keyword')
    } catch (err) {
      expect(err.message).to.equal('message: No sockets found!')
    }
  })

  it('search for existing Socket by keyword', async () => {
    const resp = await registry.searchSocketsByAll('weather')
    expect(resp[0].name).to.equal('openweathermap')
  })

  it('search for existing Socket by name', async () => {
    const resp = await registry.searchSocketByName('openweathermap')
    expect(resp.name).to.equal('openweathermap')
  })

  it.skip('submit Socket', async (done) => {
    await registry.submitSocket('keyword')
  })

  it.skip('publish Socket', async (done) => {
    await registry.publishSocket('keyword')
  })

  it('get by name', async () => {
    const socket = await registry.searchSocketByName('openweathermap')

    const fileName = path.join(testsLocation, `${getRandomString()}.zip`)
    const fileDescriptor = fs.createWriteStream(fileName)

    await registry.getSocket(socket.url, fileDescriptor)
  })

  it.skip('get by name and version', async (done) => {
    await registry.getSocket('keyword')
  })
})
