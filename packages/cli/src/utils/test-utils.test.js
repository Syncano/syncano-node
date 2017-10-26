import { expect } from 'chai'
import utils from './test-utils'

describe('[test-utils]', function () {
  describe('getRandomString', function () {
    it('returns string', function () {
      const randomString = utils.getRandomString()

      expect(randomString).to.be.a('string')
    })

    it('returns string with prefix', function () {
      const prefix = 'getrandomString_prefix'

      const randomString = utils.getRandomString(prefix)

      expect(randomString).to.contain(prefix)
    })

    it('returns two different strings', function () {
      const firstRandomString = utils.getRandomString()
      const secondRandomString = utils.getRandomString()

      expect(firstRandomString).to.not.be.equal(secondRandomString)
    })
  })

  describe('splitTestBaseEmail', function () {
    const emailName = 'test'
    const emailDomain = 'email.com'
    const tempEmail = `${emailName}@${emailDomain}`
    let splitEmail = null

    before(function () {
      splitEmail = utils.splitTestBaseEmail(tempEmail)
    })

    it('splits email and returns emailName', function () {
      expect(splitEmail.emailName).to.be.equal(emailName)
    })

    it('splits email and returns emailDomain', function () {
      expect(splitEmail.emailDomain).to.be.equal(emailDomain)
    })

    it('returns object', function () {
      expect(splitEmail).to.be.an('object')
    })

    it('returns object with proper keys', function () {
      expect(Object.keys(splitEmail)).to.be.eql(['emailName', 'emailDomain'])
    })
  })

  describe('createTempEmail', function () {
    const emailName = 'test'
    const emailDomain = 'email.com'
    const email = `${emailName}@${emailDomain}`
    const tempPass = Date.now()
    let tempEmail = null

    before(function () {
      tempEmail = utils.createTempEmail(email, tempPass)
    })

    it('returns string', function () {
      expect(tempEmail).to.be.an('string')
    })

    it('tempPass is included in email', function () {
      expect(tempEmail).to.contain(tempPass)
    })

    it('returns properly formated email', function () {
      const expectedResult = `${emailName}+${tempPass}@${emailDomain}`

      expect(tempEmail).to.equal(expectedResult)
    })
  })

  describe('returnTestGlobals', function () {
    const globals = utils.returnTestGlobals()

    it('returns object', function () {
      expect(globals).to.be.a('object')
    })

    it('should return proper global keys', function () {
      const expectedResult = ['email', 'password', 'accountKey', 'syncanoYmlPath', 'instance']

      expect(Object.keys(globals)).to.eql(expectedResult)
    })
  })
})
