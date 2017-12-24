/* global it describe afterEach beforeEach */
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import format from 'chalk'
import createError from 'create-error'

import { SocketDeploy } from '../../src/commands'
import printTools from '../../src/utils/print-tools'
import { currentTime, Timer } from '../../src/utils/date-utils'

sinon.test = sinonTestFactory(sinon)

describe('[commands] Trace Sockets', function () {
  const interEcho = sinon.stub()
  const interError = sinon.stub()
  let echo = null
  let error = null

  beforeEach(function () {
    echo = sinon.stub(printTools, 'echo').callsFake((content) => interEcho)
    error = sinon.stub(printTools, 'error').callsFake((content) => interError)
  })

  afterEach(function () {
    echo.restore()
    error.restore()
  })

  describe('printUpdateSuccessful', function () {
    it('should echo properly formatted message', function () {
      const socketNameStr = format.cyan('foo')
      const timer = new Timer()
      sinon.stub(timer, 'getDurationTime').callsFake(() => 42)

      SocketDeploy.printUpdateSuccessful('foo', { status: 'ok' }, timer)

      sinon.assert.calledWith(interEcho, `${format.grey('socket synced:')} ${currentTime()} ${socketNameStr} ${format.dim(42, 'ms')}`)
    })
  })

  describe('printUpdateFailed', function () {
    it('should echo properly formatted message', function () {
      try {
        createError({ detail: 'foo' })
      } catch (err) {
        const timer = new Timer()
        sinon.stub(timer, 'getDurationTime').callsFake(() => 42)

        SocketDeploy.printUpdateFailed('foo', err, new Timer())

        sinon.assert.calledWith(interEcho, `Socket's remote configuration update failed ${format.dim(42, 'ms')}`)
      }
    })
  })
})
