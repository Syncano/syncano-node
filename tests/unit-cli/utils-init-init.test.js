/* global it describe afterEach beforeEach */
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import path from 'path'
import format from 'chalk'

import { getRandomString } from '@syncano/test-tools'

import Init from '../../src/utils/init'
import printTools from '../../src/utils/print-tools'

sinon.test = sinonTestFactory(sinon)

describe('[commands] init', function () {
  const init = new Init()
  let interEcho = null
  let echo = null

  beforeEach(function () {
    interEcho = sinon.stub()
    echo = sinon.stub(printTools, 'echo').callsFake((content) => interEcho)
  })

  afterEach(function () {
    interEcho.reset()
    printTools.echo.restore()
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

      sinon.assert.calledWith(addProject, path.join(process.cwd(), 'syncano'), projectParams)
    })

    it('should print response about connected instance with proper padding', async function () {
      const response = `Your project is attached to ${format.green(projectParams.instance)} instance now!`

      await init.addConfigFiles(projectParams)

      sinon.assert.calledWith(echo, 4)
      sinon.assert.calledWith(interEcho, response)
    })
  })
})
