/* global it describe afterEach beforeEach */
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import path from 'path'

import { getRandomString } from '@syncano/test-tools'

import Init from '../../src/utils/init'

sinon.test = sinonTestFactory(sinon)

describe('[commands] init', function () {
  const init = new Init()
  let interEcho = null

  beforeEach(function () {
    interEcho = sinon.stub()
  })

  afterEach(function () {
    interEcho.reset()
  })

  describe('[addConfigFiles]', function () {
    let addProject = null
    const projectParams = { instance: getRandomString('init_projectParams') }

    beforeEach(function () {
      addProject = sinon.stub(init.session.settings.account, 'addProject')
    })

    afterEach(function () {
      if (init.session.settings.account.addProject.restore instanceof Function) {
        init.session.settings.account.addProject.restore()
      }
    })

    it('should call add project method with proper parameters', async function () {
      await init.addConfigFiles(projectParams)

      sinon.assert.calledWith(addProject, path.join(process.cwd()), projectParams)
    })
  })
})
