/* global it describe before after beforeEach */
import mock from 'mock-fs'
import fs from 'fs'
import dirtyChai from 'dirty-chai'
import chai from 'chai'
import YAML from 'js-yaml'

import Settings from '../../src/settings/settings'

chai.use(dirtyChai)
const { expect } = chai

let settings = {}
function Attributes () {
  this.auth_key = 'bb093bb55b16eaae1b3329df3bb3d8278ef02a91'
  this.test_key = '8x6od4eacnb89scvefrlcv7vi'
  this.projects = {
    '/Users/test': {
      instance: 'divine-wood-1583'
    }
  }
}

const attrs = new Attributes()
const dumpedAttributes = YAML.dump(attrs)

describe('[settings] Settings', function () {
  before(function () {
    mock({
      '/Users/test': {
        'syncano-test.yml': dumpedAttributes
      }
    })
  })

  beforeEach(function () {
    settings = new Settings()
  })

  after(function () {
    mock.restore()
  })

  it('Has correct default properties', function () {
    // expect(typeof settings.attributes).to.be.object // eslint-disable-line
    expect(Object.keys(settings.attributes).length).to.be.equal(0)
    expect(settings.configPath).to.be.null()
  })

  it('Loads yml file correctly', function () {
    settings.baseDir = '/Users/test'
    settings.name = 'syncano-test'
    const ymlLoaded = settings.load()

    expect(ymlLoaded).to.be.true()
    expect(settings.attributes.auth_key).to.be.equal('bb093bb55b16eaae1b3329df3bb3d8278ef02a91')
    expect(settings.attributes.test_key).to.be.equal('8x6od4eacnb89scvefrlcv7vi')
    expect(settings.attributes.projects['/Users/test'].instance).to.be.equal('divine-wood-1583')
  })

  it('Does not load yml if baseDir does not exist', function () {
    settings.baseDir = '/i/do/not/exist'
    settings.name = 'syncano-test'

    const ymlLoaded = settings.load()
    expect(ymlLoaded).to.be.false()
  })

  it('Does not load yml if configPath does not exist', function () {
    settings.baseDir = '/Users/test'
    settings.name = 'nope'

    const ymlLoaded = settings.load()
    expect(ymlLoaded).to.be.false()
  })

  it('Saves attributes to YAML file', function () {
    const attributes = new Attributes()
    settings.attributes = { ...attributes }
    settings.configPath = '/Users/test/syncano-test.yml'
    settings.attributes.auth_key = 'new'
    settings.attributes.projects['/Users/test'].instance = 'fearless-frog-666'
    settings.save()

    const content = YAML.load(fs.readFileSync('/Users/test/syncano-test.yml', 'utf8'))
    expect(content.auth_key).to.be.equal('new')
    expect(content.projects['/Users/test'].instance).to.be.equal('fearless-frog-666')
  })

  it('Gets an attribute', function () {
    const attributes = new Attributes()
    settings.attributes = { ...attributes }

    const authKey = settings.get('auth_key')
    expect(authKey).to.be.equal('bb093bb55b16eaae1b3329df3bb3d8278ef02a91')
  })

  it('Can\'t get non existing attribute', function () {
    const attributes = new Attributes()
    settings.attributes = { ...attributes }

    const notThere = settings.get('imNotThere')
    expect(notThere).to.be.null()
  })
})
