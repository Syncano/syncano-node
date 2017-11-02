'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})

var _data = require('./data')

var _data2 = _interopRequireDefault(_data)

var _users = require('./users')

var _users2 = _interopRequireDefault(_users)

var _account = require('./account')

var _account2 = _interopRequireDefault(_account)

var _instance = require('./instance')

var _instance2 = _interopRequireDefault(_instance)

var _event = require('./event')

var _event2 = _interopRequireDefault(_event)

var _socket = require('./socket')

var _socket2 = _interopRequireDefault(_socket)

var _response = require('./response')

var _response2 = _interopRequireDefault(_response)

var _logger = require('./logger')

var _logger2 = _interopRequireDefault(_logger)

var _channel = require('./channel')

var _channel2 = _interopRequireDefault(_channel)

var _class2 = require('./class')

var _class3 = _interopRequireDefault(_class2)

var _settings = require('./settings')

var _settings2 = _interopRequireDefault(_settings)

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj}
}

const server = (ctx = {}) => {
  const settings = new _settings2.default(ctx)
  const getConfig = className => Object.assign({className}, settings)
  const config = getConfig()

  const _class = new _class3.default(config)
  const users = new _users2.default(config)
  const event = new _event2.default(config)
  const channel = new _channel2.default(config)
  const socket = new _socket2.default(config)
  const response = new _response2.default(config)
  const account = new _account2.default(config)
  const instance = new _instance2.default(config)

  _logger2.default.config = ctx.meta.debug

  return {
    _class,
    users,
    account,
    instance,
    event,
    channel,
    socket,
    response,
    logger: _logger2.default,
    data: new Proxy(new _data2.default(settings), {
      get(target, className) {
        return new _data2.default(getConfig(className))
      }
    })
  }
}

exports.default = server
