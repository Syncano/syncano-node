/* global it describe before afterEach beforeEach */
import dirtyChai from 'dirty-chai'
import chai from 'chai'
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import fs from 'fs'
import YAML from 'js-yaml'

import { getRandomString } from '@syncano/test-tools'
import AccountSettings from '../../src/settings/accountSettings'

sinon.test = sinonTestFactory(sinon)

chai.use(dirtyChai)
const { expect } = chai

let account = {}

describe('[settings]', function () {
  before(function () {
    const sandbox = sinon.sandbox.create()
    if (process.env.SYNCANO_PROJECT_INSTANCE) sandbox.stub(process.env, 'SYNCANO_PROJECT_INSTANCE')
    if (process.env.SYNCANO_AUTH_KEY) sandbox.stub(process.env, 'SYNCANO_AUTH_KEY')
  })

  beforeEach(function () {
    account = new AccountSettings()
  })

  describe('Account', function () {
    let accountKey = null
    let accountValue = null

    beforeEach(function () {
      sinon.stub(account, 'save')
      accountKey = 'test_key'
      accountValue = getRandomString('settings_account_accountValue')
    })

    afterEach(function () {
      account.save.restore()
    })

    it('sets test_key', function () {
      const accountSetKey = account.set(accountKey, accountValue, true)

      expect(accountSetKey.attributes.test_key).to.be.equal(accountValue)
    })

    it('list test_key', function () {
      account.attributes.test_key = accountValue
      const accountGetKey = account.get(accountKey)

      expect(accountGetKey).to.be.equal(accountValue)
    })

    it('loads yaml configuration', sinon.test(function () {
      account.baseDir = '/User/test'
      account.name = 'syncano'
      this.stub(fs, 'accessSync')
      this.stub(fs, 'readFileSync')
      this.stub(YAML, 'load')

      expect(account.load()).to.be.true()
    }))
  })

  describe('Logout', function () {
    beforeEach(function () {
      const attributes = { auth_key: getRandomString('settings_account_attributes_auth_key[0]') }
      account.attributes = attributes
      account.configPath = '/Users/test/nope.yml'
    })

    it('should called save method from Account class', sinon.test(function () {
      const save = this.stub(account, 'save')
      account.logout()

      sinon.assert.calledOnce(save)
    }))

    it('should remove auth_key from attributes', sinon.test(function () {
      this.stub(account, 'save')
      account.logout()

      expect(account).to.not.have.deep.property('attributes.auth_key')
    }))
  })

  describe('Authenticated', function () {
    it('should return true if auth_key exists', function () {
      const attributes = { auth_key: getRandomString('settings_account_attributes_auth_key[1]') }
      account.attributes = attributes
      const isAuthenticated = account.authenticated()

      expect(isAuthenticated).to.be.equal(true)
    })

    it('should return false when auth_key does not exists', function () {
      account.attributes = {}
      const isAuthenticated = account.authenticated()

      expect(isAuthenticated).to.be.false()
    })
  })
})
