'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})

var _querystring = require('querystring')

var _querystring2 = _interopRequireDefault(_querystring)

var _data = require('./data')

var _data2 = _interopRequireDefault(_data)

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj}
}

/**
 * Syncano users query builder
 * @property {Function}
 */
class Users extends _data2.default {
  url(id) {
    const {instanceName} = this.instance
    const url = `${this._getInstanceURL(instanceName)}/users/${id
      ? id + '/'
      : ''}`
    const query = _querystring2.default.stringify(this.query)

    return query ? `${url}?${query}` : url
  }
}

exports.default = Users
