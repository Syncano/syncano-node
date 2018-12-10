import * as should from 'should'
import {Response} from '../../src/response'
import Server from '../../src/server'

describe('Response', () => {
  const {response} = new Server({
    token: 'testKey',
    instanceName: 'testInstance',
    meta: {
      metadata: {
        outputs: {
          success: {
            exit_code: 200
          },
          fail: {
            exit_code: 400,
            mimetype: 'plain/text'
          }
        }
      }
    }
  })

  let res: Response

  beforeEach(() => {
    res = response()
  })

  it('init without error', () => {
    should(res).not.throw()
  })

  it('has content property set to null', () => {
    should(res)
      .have.property('content')
      .which.is.null()
  })

  it('has status property set to 200', () => {
    should(res)
      .have.property('status')
      .which.is.equal(200)
  })

  it('has mimetype property set to text/plain', () => {
    should(res)
      .have.property('mimetype')
      .which.is.equal('text/plain')
  })

  it('has headers property set to {}', () => {
    should(res)
      .have.property('headers')
      .which.is.Object()
  })

  it('should use setResponse to return response', (done) => {
    class HttpResponse {}

    const {response: r} = new Server({
      token: 'testKey',
      instanceName: 'testInstance',
      setResponse: () => done(),
      HttpResponse
    })

    r('hello')
  })

  describe('#header()', () => {
    it('should be a method of the model', () => {
      should(response)
        .have.property('header')
        .which.is.Function()
    })

    it('should add X-TEST to headers', () => {
      response.header('X-TEST', 'Hello World')

      should(response)
        .have.property('headers')
        .which.is.deepEqual({
          'X-TEST': 'Hello World'
        })
    })

    it('should handle methods defined in yaml', () => {
      should(response.success({hello: 'World'})).properties({
        status: 200,
        mimetype: 'application/json',
        content: '{"hello":"World"}'
      })

      should(response.fail('Bad request')).properties({
        status: 400,
        mimetype: 'plain/text',
        content: 'Bad request'
      })
    })
  })

  describe('#json()', () => {
    it('should be a method of the model', () => {
      should(response)
        .have.property('json')
        .which.is.Function()
    })

    it('should change mimetype to application/json', () => {
      should(response.json())
        .have.property('mimetype')
        .which.is.equal('application/json')
    })

    it('should parse content to json', () => {
      should(response.json({hello: 'World'}))
        .have.property('content')
        .which.is.equal('{"hello":"World"}')
    })
  })
})
