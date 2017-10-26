import sinon from 'sinon'
import fs from 'fs-extra'
import path from 'path'
import format from 'chalk'

import Init from './init'
import { mainSocketTemplatePath } from '../../constants/Constants'
import { getRandomString } from '../test-utils'
import printTools from '../print-tools'

describe('[commands] init', function () {
  const init = new Init()
  let interEcho = null
  let echo = null

  beforeEach(function () {
    interEcho = sinon.stub()
    echo = sinon.stub(printTools, 'echo', (content) => interEcho)
  })

  afterEach(function () {
    interEcho.reset()
    printTools.echo.restore()
  })

  describe.skip('[createFilesAndFolders]', function () {
    it('creates folder structure in project path', sinon.test(function () {
      const copySyncStub = this.stub(fs, 'copySync')
      const projectPath = `${process.cwd()}/syncano`
      this.stub(process.stdout, 'write')

      init.createFilesAndFolders(projectPath)

      sinon.assert.calledWith(copySyncStub, mainSocketTemplatePath, `${projectPath}/../`)
    }))
  })

  describe('[addConfigFiles]', function () {
    let addProject = null
    const projectParams = { instance: getRandomString('init_projectParams') }

    beforeEach(function () {
      addProject = sinon.stub(init.session.settings.account, 'addProject')
    })

    afterEach(function () {
      init.session.settings.account.addProject.restore()
    })

    it('should call add project method with proper parameters', function () {
      init.addConfigFiles(projectParams)

      sinon.assert.calledWith(addProject, path.join(process.cwd(), 'syncano'), projectParams)
    })

    it('should print response about connected instance with proper padding', function () {
      const response = `Your project is attached to ${format.green(projectParams.instance)} instance now!`

      init.addConfigFiles(projectParams)

      sinon.assert.calledWith(echo, 4)
      sinon.assert.calledWith(interEcho, response)
    })
  })
})
