import { expect } from 'chai'
import sinon from 'sinon'
import program from '.'
import session from '../utils/session'
import { getRandomString } from '../utils/test-utils'

describe('[program]', function () {
  before(function () {
    session.projectPath = '.'
    return session.load()
  })

  describe('has prototype', function () {
    it('missingArgument', function () {
      expect(program).to.respondTo('missingArgument')
    })

    it('optionMissingArgument', function () {
      expect(program).to.respondTo('optionMissingArgument')
    })

    it('commandHelp', function () {
      expect(program).to.respondTo('commandHelp')
    })

    it('helpInformation', function () {
      expect(program).to.respondTo('helpInformation')
    })
  })

  describe('print error', function () {
    const parameter = getRandomString('program_parameter')

    it('missingArgument', sinon.test(function () {
      const outputHelp = this.stub(program, 'outputHelp')
      const exit = this.stub(process, 'exit')
      const log = this.stub(process.stdout, 'write')

      program.missingArgument(parameter)
      sinon.assert.calledOnce(log)
      sinon.assert.calledOnce(outputHelp)
      sinon.assert.calledOnce(exit)
    }))

    it('optionMissingArgument', sinon.test(function () {
      const outputHelp = this.stub(program, 'outputHelp')
      const exit = this.stub(process, 'exit')
      const log = this.stub(process.stdout, 'write')

      program.optionMissingArgument(parameter)
      sinon.assert.calledOnce(log)
      sinon.assert.calledOnce(outputHelp)
      sinon.assert.calledOnce(exit)
    }))
  })

  describe('print help', function () {
    beforeEach(function () {
      sinon.stub(program, 'commandHelp')
    })

    afterEach(function () {
      program.commandHelp.restore()
    })

    it('with current instance name', function () {
      const instanceName = getRandomString('program_instanceName')
      session.project = { instance: instanceName }
      const information = program.helpInformation()

      expect(information).to.contain('Current Instance:', instanceName)
    })
    it('without current instance name', function () {
      session.project = { instance: '' }
      const information = program.helpInformation()

      expect(information).to.not.contain('Current Instance:')
    })
  })
})
