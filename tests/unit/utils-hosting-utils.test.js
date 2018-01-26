/* global it describe */
import dirtyChai from 'dirty-chai'
import chai from 'chai'
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'

import { getRandomString } from '@syncano/test-tools'

import { getFiles, asyncDir } from '../../src/utils/hosting/utils'

sinon.test = sinonTestFactory(sinon)

chai.use(dirtyChai)
const { expect } = chai

describe('[hosting] Sync Hosting', function () {
  describe('getFiles', function () {
    it('should be fulfilled', function () {
      const promise = getFiles()

      expect(promise).to.be.fulfilled()
    })

    it('should return list of files', sinon.test(async function () {
      const filesArray = [
        { path: getRandomString('syncHosting_filesArray[0].path') },
        { path: getRandomString('syncHosting_filesArray[1].path') }
      ]
      this.stub(asyncDir, 'filesAsync').returns(Promise.resolve(filesArray))

      const files = await getFiles('.')

      expect(files).to.be.instanceof(Array)
    }))

    it('should return error code when promise reject', sinon.test(async function () {
      const errorMessage = {
        code: getRandomString('hostingClass_errorMessage_code')
      }
      this.stub(asyncDir, 'filesAsync').returns(Promise.reject(errorMessage))

      const error = await getFiles('.')

      expect(error).to.be.equal(errorMessage.code)
    }))
  })
})
