/* eslint-disable */
'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})

var _syncanoServer = require('syncano-server')

var _syncanoServer2 = _interopRequireDefault(_syncanoServer)

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj}
}

exports.default = function(ctx) {
  var _ref = new _syncanoServer2.default(ctx),
    response = _ref.response

  response.json({
    hello: 'World'
  })
}

module.exports = exports['default']
