import * as should from 'should/as-function'
import {NotFoundError, SyncanoError} from '../../src/errors'

describe('SyncanoError', () => {
  let error = null

  beforeEach(() => {
    error = new SyncanoError('dummy')
  })

  it('is a function', () => {
    should(SyncanoError).be.a.Function()
  })

  it('has a proper name attribute', () => {
    should(error)
      .have.property('name')
      .which.is.String()
      .equal('SyncanoError')
  })

  it('has a proper message attribute', () => {
    should(error)
      .have.property('message')
      .which.is.String()
      .equal('dummy')
  })

  it('has a proper stack attribute', () => {
    should(error)
      .have.property('stack')
      .which.is.String()
  })

  it('has defaults', () => {
    should(new SyncanoError(''))
      .have.property('message')
      .which.is.String()
      .equal('')
  })
})

describe('NotFoundError', () => {
  let error = null

  beforeEach(() => {
    error = new NotFoundError('dummy')
  })

  it('is a function', () => {
    should(NotFoundError).be.a.Function()
  })

  it('has a proper name attribute', () => {
    should(error)
      .have.property('name')
      .which.is.String()
      .equal('NotFoundError')
  })

  it('has a proper message attribute', () => {
    should(error)
      .have.property('message')
      .which.is.String()
      .equal('dummy')
  })

  it('has a proper stack attribute', () => {
    should(error)
      .have.property('stack')
      .which.is.String()
  })

  it('has defaults', () => {
    should(new NotFoundError())
      .have.property('message')
      .which.is.String()
      .equal('No results for given query.')
  })
})
