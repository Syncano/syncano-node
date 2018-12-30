/* global it describe afterEach beforeEach */
import { expect } from 'chai'
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import fs from 'fs'
import YAML from 'js-yaml'

import { getRandomString } from '@syncano/test-tools'

import ProjectSettings from '../../src/settings/projectSettings'

sinon.test = sinonTestFactory(sinon)

describe('[settings] Project Settings', function () {
  let settings = {}

  beforeEach(function () {
    settings = new ProjectSettings('.')
    sinon.stub(settings, 'save')
  })

  afterEach(function () {
    settings.save.restore()
  })

  describe('Hosting', function () {
    describe.skip('getAllSocketsYmlPath', function () {
      it('should return array of files named socket.yml', async function () {
        settings.baseDir = './templates'

        const response = await settings.getAllSocketsYmlPath()

        expect(response).to.satisfy((ymlPaths) => (
          ymlPaths.every((ymlPath) => {
            const splittedPath = ymlPath.split('/')
            const fileName = splittedPath.pop()

            return fileName === 'socket.yml'
          })
        ))
      })
    })

    describe('getAttributesFromYaml', function () {
      const example = {
        name: 'hello',
        hosting: {
          staging: {
            src: getRandomString('projectSettings_hosting_getAttributesFromYaml_hosting_staging_src'),
            cname: null
          }
        }
      }

      beforeEach(function () {
        sinon.stub(YAML, 'load').returns(example)
        sinon.stub(fs, 'readFileSync')
      })

      afterEach(function () {
        YAML.load.restore()
        fs.readFileSync.restore()
      })

      it('should return socket attributes', function () {
        const ymlPath = getRandomString('projectSettings_hosting_getAttributesFromYaml_ymlPath')

        const response = ProjectSettings.getAttributesFromYaml(ymlPath)

        expect(response).to.be.eql(example)
      })
    })
  })
})
