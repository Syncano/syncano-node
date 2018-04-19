import should from 'should/as-function'
import Server from '../../src/server'

describe('Logger', () => {
  let logger
  let log = null

  beforeEach(() => {
    const server = new Server({
      token: 'testKey',
      instanceName: 'testInstance'
    })

    logger = server.logger
    log = logger('scope')
  })

  it('init without error', () => {
    should(log).not.throw()
  })

  it('has start property set to Date', () => {
    should(log).have.property('start').which.is.instanceOf(Date)
  })

  it('has callback property set to undefined', () => {
    should(log).have.property('callback', undefined)
  })

  describe('#log.warn', () => {
    it('execute without error', (done) => {
      try {
        log.warn('test')
        done()
      } catch (err) {
        done(err)
      }
    })

    it('can log object', (done) => {
      try {
        log.warn({name: 'John'})
        done()
      } catch (err) {
        done(err)
      }
    })
  })

  describe('#listen()', () => {
    it('should be a method of the model', () => {
      should(logger)
        .have.property('listen')
        .which.is.Function()
    })

    it('should throw when callback was not passed', () => {
      should(logger.listen).throw(/Callback must be a function./)
    })

    it('should save callback', () => {
      logger.listen(() => {
        //
      })

      should(logger)
        .have.property('callback')
        .which.is.Function()
    })

    it('should execute callback', (done) => {
      logger.listen(() => {
        done()
      })

      logger('scope').info('hello')
    })
  })

  describe('#setLevels()', () => {
    it('should be a method of the model', () => {
      should(logger)
        .have.property('setLevels')
        .which.is.Function()
    })

    it('should throw when array was not passed', () => {
      should(logger.setLevels).throw(/Levels must be array of strings\./)
    })

    it('should set levels', () => {
      logger.setLevels(['info', 'custom'])

      should(logger.levels).be.deepEqual(['info', 'custom'])
    })
  })

  describe('#debug()', () => {
    it('should be a method of the model', () => {
      should(log)
        .have.property('debug')
        .which.is.Function()
    })
  })

  describe('#error()', () => {
    it('should be a method of the model', () => {
      should(log)
        .have.property('error')
        .which.is.Function()
    })
  })

  describe('#info()', () => {
    it('should be a method of the model', () => {
      should(log)
        .have.property('info')
        .which.is.Function()
    })
  })

  describe('#warn()', () => {
    it('should be a method of the model', () => {
      should(log)
        .have.property('warn')
        .which.is.Function()
    })
  })
})
