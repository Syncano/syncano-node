/* global it describe */
import { expect } from 'chai'
import uniqueInstance from '../../src/utils/unique-instance'

function isGeneratedWithPattern (name) {
  const splitedName = name.split('-')
  const rnd = parseInt(splitedName[2])
  return typeof rnd === 'number'
}

describe('[utils] Unique instance generates', function () {
  it('random name', function () {
    const generatedName = uniqueInstance()

    expect(generatedName).to.be.a('string')
  })

  it('two different names', function () {
    const firstGeneratedName = uniqueInstance()
    const secondGeneratedName = uniqueInstance()

    expect(firstGeneratedName).not.equal(secondGeneratedName)
  })

  it('name according to pattern', function () {
    const generatedName = uniqueInstance()

    expect(generatedName).to.satisfy(isGeneratedWithPattern)
  })
})
