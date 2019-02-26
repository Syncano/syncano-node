/* global it describe before */
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import format from 'chalk'
import 'console.mute'
import { expect } from 'chai'
import _ from 'lodash'

import { MAP, printCode, getFormatMethod, warning, error } from '../../src/utils/print-tools'

sinon.test = sinonTestFactory(sinon)

function increaseByOne (number) {
  return number + 1
}

describe('[utils] Response codes map', function () {
  before(function () {
    const sandbox = sinon.sandbox.create()
    if (process.env.SYNCANO_PROJECT_INSTANCE) sandbox.stub(process.env, 'SYNCANO_PROJECT_INSTANCE')
    if (process.env.SYNCANO_AUTH_KEY) sandbox.stub(process.env, 'SYNCANO_AUTH_KEY')
  })

  describe('printCode', function () {
    _.times(6, increaseByOne).forEach(function (number) {
      it(`for status code ${number}xx`, function () {
        const codeNumber = _.random(number * 100, ((number + 1) * 100) - 1)
        const formatMethod = getFormatMethod(codeNumber)
        const expectedResult = MAP[number] || MAP[0]

        expect(formatMethod).to.be.equal(expectedResult)
      })
    })
  })

  describe('printCode with description', function () {
    it('should contain "Processing"', function () {
      const codeNumber = _.random(100, 600)
      const statusDescription = 'Processing'
      const printedCode = printCode(codeNumber, statusDescription)

      expect(printedCode).to.contain(statusDescription)
    })
  })

  describe('printing warnings', function () {
    it('should print in yellow', function () {
      console.mute()

      warning('Warning!')
      const stdout = console.resume().stdout[0]
      expect(stdout).to.contain(format.yellow('Warning! '))
    })
  })
  describe('printing errors', function () {
    it('should construct proper message with a single arg', function () {
      console.mute()

      error('Not found!')
      const stdout = console.resume().stdout[0]
      expect(stdout).to.contain(format.red('Not found! '))
    })
    it('should construct proper message with multiple args', function () {
      console.mute()

      try {
        throw new Error()
      } catch (err) {
        error(err, ': Instance "foo-bar-4334" was not found')
        const stdout = console.resume().stdout[0]

        expect(stdout).to.contain(format.red(': Instance "foo-bar-4334" was not found '))
      }
    })
  })
})
