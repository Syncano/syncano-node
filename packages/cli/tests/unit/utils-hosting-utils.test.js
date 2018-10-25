/* global it describe */
import dirtyChai from 'dirty-chai'
import chai from 'chai'
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'

import { getRandomString } from '@syncano/test-tools'

import { getFiles } from '../../src/utils/hosting/utils'
import glob from 'glob'

sinon.test = sinonTestFactory(sinon)

chai.use(dirtyChai)
const { expect } = chai

describe('[hosting] Sync Hosting', function () {
  describe('getFiles', function () {
    it('should return list of files', sinon.test(async function () {
      const filesArray = [
        getRandomString('syncHosting_filesArray[0].path'),
        getRandomString('syncHosting_filesArray[1].path')
      ]
      this.stub(glob, 'sync').returns(filesArray)

      const files = await getFiles('.')

      expect(files).to.be.instanceof(Array)
    }))
  })
})
