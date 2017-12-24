/* global it describe afterEach beforeEach */
import { expect } from 'chai'
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import inquirer from 'inquirer'

import { getRandomString } from '@syncano/test-tools'

import { Attach } from '../../src/commands'
import context from '../../src/utils/context'
import printTools from '../../src/utils/print-tools'

sinon.test = sinonTestFactory(sinon)

describe('[commands] Attach', function () {
  let attach = null
  let prompt = null
  let exitProcess = null

  beforeEach(function () {
    attach = new Attach(context)
    attach.session.project = { instance: getRandomString('attach_session_project_instance') }
    prompt = sinon.stub(inquirer, 'prompt')
    exitProcess = sinon.stub(process, 'exit')
  })

  afterEach(function () {
    inquirer.prompt.restore()
    process.exit.restore()
  })

  describe('[run]', function () {
    let createNewInstance = null

    beforeEach(function () {
      sinon.stub(attach, 'Init').returns({
        addConfigFiles: (configFiles) => configFiles
      })
      sinon.stub(attach.session, 'load')
      createNewInstance = sinon.stub(attach, 'createNewInstance')
      sinon.stub(attach, 'getQuestions')
    })

    afterEach(function () {
      attach.session.load.restore()
      attach.createNewInstance.restore()
      attach.getQuestions.restore()
    })

    it('should prompt 1 question', async function () {
      attach.session.project = getRandomString('attach_session_project')
      prompt.returns(Promise.resolve({ confirm: false }))

      await attach.run([])

      sinon.assert.calledOnce(prompt)
    })

    it('should prompt 2 questions', async function () {
      prompt.returns(Promise.resolve({}))

      await attach.run([])

      sinon.assert.calledTwice(prompt)
    })

    it('should exit process if did not confirmed', async function () {
      prompt.returns({ confirm: false })

      await attach.run([])

      sinon.assert.calledOnce(exitProcess)
    })

    it('should create new instance if choosen proper option from list', async function () {
      prompt.returns(Promise.resolve({ instance: printTools.p(2)('Create a new one...') }))

      await attach.run([])

      sinon.assert.calledOnce(createNewInstance)
    })

    it('should add config files with new instance name', async function () {
      const newInstanceName = getRandomString('attach_newInstanceName')
      const init = new attach.Init()
      const addConfigFiles = sinon.stub(init, 'addConfigFiles')

      prompt.returns(Promise.resolve({ instance: printTools.p(2)('Create a new one...') }))
      createNewInstance.returns(newInstanceName)

      await attach.run([])

      init.addConfigFiles.restore()

      sinon.assert.calledWith(addConfigFiles, { instance: newInstanceName })
    })
  })

  describe('[createNewInstance]', function () {
    let createInstance = null

    beforeEach(function () {
      createInstance = sinon.stub(attach.session, 'createInstance').returns(Promise.resolve({}))
    })

    afterEach(function () {
      attach.session.createInstance.restore()
    })

    it('should run prompt method', async function () {
      prompt.returns(Promise.resolve({ instanceName: getRandomString('attach_prompt_instanceName[0]') }))

      await attach.createNewInstance()

      sinon.assert.calledOnce(prompt)
    })

    it('should run createInstance method with choosen instance name', async function () {
      const choosenInstanceName = getRandomString('attach_prompt_instanceName[1]')
      prompt.returns(Promise.resolve({ instanceName: choosenInstanceName }))

      await attach.createNewInstance()

      sinon.assert.calledWith(createInstance, choosenInstanceName)
    })
  })

  describe('[getQuestions]', function () {
    describe('should return questions about', function () {
      const instances = [
        { name: getRandomString('attach_instanceName[0]') },
        { name: getRandomString('attach_instanceName[1]') }
      ]
      const expectedQuestions = [
        {
          type: 'confirm',
          name: 'confirm',
          message: printTools.p(2)('This project is already attached. Are you sure you want to change instance?'),
          default: false
        },
        {
          name: 'instance',
          type: 'list',
          pageSize: 16,
          message: printTools.p(2)('Choose instance for your project:'),
          choices: ['  Create a new one...', `  ${instances[0].name}`, `  ${instances[1].name}`],
          default: 0
        }
      ]

      beforeEach(function () {
        sinon.stub(attach.session, 'getInstances').returns(Promise.resolve(instances))
      })

      afterEach(function () {
        attach.session.getInstances.restore()
      })

      it('instance', async function () {
        attach.session.project = null
        attach.cmd = {}

        const questions = await attach.getQuestions()

        expect(questions).to.be.eql([expectedQuestions[1]])
      })
    })
  })
})
