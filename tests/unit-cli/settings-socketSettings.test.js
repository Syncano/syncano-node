/* global it describe afterEach beforeEach */
import dirtyChai from 'dirty-chai'
import chai from 'chai'
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import SocketSettings from '../../src/settings/socketSettings'

sinon.test = sinonTestFactory(sinon)
chai.use(dirtyChai)
const { expect } = chai

describe('[settings] Socket Settings', function () {
  let settings = {}

  beforeEach(function () {
    settings = new SocketSettings('.', 'dummy_socket')
    sinon.stub(settings, 'save')
  })

  afterEach(function () {
    settings.save.restore()
  })

  describe('Hosting', function () {
    const attributes = {
      hosting: {
        staging: { src: '/' },
        production: { src: '/prod' }
      }
    }

    it('Gets single hosting', function () {
      settings.attributes = attributes
      // const hosting = settings.getHosting(Object.keys(attributes.hosting)[0])
      settings.getHosting(Object.keys(attributes.hosting)[0])

      // expect(hosting).to.be.object // eslint-disable-line
    })

    it('Gets single hosting path', function () {
      settings.attributes = attributes
      const hosting = settings.getHosting(Object.keys(attributes.hosting)[0])

      expect(hosting.path).to.equal(attributes.hosting.staging.path)
    })

    it('Returns undefined if non existing hosting name is provided', function () {
      settings.attributes = attributes
      const hosting = settings.getHosting('nope')

      expect(hosting).to.be.undefined()
    })

    it('Returns null if hosting attributes are not defined', function () {
      settings.attributes = {}
      const hosting = settings.getHosting('nope')

      expect(hosting).to.be.null()
    })

    it('Gets multiple hostings', function () {
      settings.attributes = attributes
      settings.listHosting()
      // const hostings = settings.listHosting()

      // expect(hostings).to.be.array // eslint-disable-line
    })

    it('Gets multiple hostings name', function () {
      settings.attributes = attributes
      const hostings = settings.listHosting()

      hostings.forEach((hosting, index) => {
        expect(hosting.name).to.equal(Object.keys(attributes.hosting)[index])
      })
    })

    it('Gets multiple hostings path', function () {
      settings.attributes = attributes
      const hostings = settings.listHosting()

      hostings.forEach((hosting, index) => {
        expect(hosting.src).to.equal(attributes.hosting[hosting.name].src)
      })
    })

    it('should remove given hosting from attributes', function () {
      settings.attributes = attributes

      settings.deleteHosting('staging')

      expect(settings.attributes.hosting).to.eql({
        production: { src: '/prod' }
      })
    })

    it('should remove hosting key from attributes object if last hosting is deleting', function () {
      settings.attributes.hosting = {
        production: { src: '/prod' }
      }

      settings.deleteHosting('production')

      return expect(settings.attributes.hosting).to.be.undefined()
    })
  })
})
