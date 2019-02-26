/* global it describe beforeEach afterEach */
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import format from 'chalk'

import program from '../../src/program'
import printTools from '../../src/utils/print-tools'
import validateCommands from '../../src/utils/validate-commands'

sinon.test = sinonTestFactory(sinon)

describe('[utils] Validate command', function () {
  const randomString = Math.random().toString(36).substring(7)
  const commandsArr = [randomString, `${randomString}${randomString}`]
  const text = 'is not a valid command, you can find valid commands below:'
  const invalidCommand = `\n '${commandsArr[0]}' ${format.red(text)}`
  let outputHelp = null
  let echo = null

  beforeEach(function () {
    outputHelp = sinon.stub(program, 'outputHelp')
    echo = sinon.stub(printTools, 'echo')
  })

  afterEach(function () {
    program.outputHelp.restore()
    printTools.echo.restore()
  })

  it('should print error for command which does not exist', function () {
    validateCommands(commandsArr)

    sinon.assert.calledWith(echo, invalidCommand)
  })

  it('should print help for command which does not exist', function () {
    validateCommands(commandsArr)

    sinon.assert.called(outputHelp)
  })

  it('should do nothing if command exists', function () {
    program.commands = [
      {
        _name: randomString
      }
    ]

    validateCommands([randomString])

    sinon.assert.notCalled(outputHelp)
    sinon.assert.notCalled(echo)
  })
})
