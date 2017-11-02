'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})

var _queryBuilder = require('./query-builder')

var _queryBuilder2 = _interopRequireDefault(_queryBuilder)

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj}
}

/**
 * Syncano account query builder
 * @property {Function}
 */
class Account extends _queryBuilder2.default {
  url() {
    return `${this._getSyncanoURL()}/account/`
  }

  /**
   * Get details of Syncano account
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * const account = await account.get('0aad29dd0be2bcebb741525b9c5901e55cf43e98')
   */
  get(authKey) {
    const fetch = this.nonInstanceFetch.bind(this)
    return new Promise((resolve, reject) => {
      const headers = {
        'X-API-KEY': authKey
      }

      fetch(this.url(), {}, headers)
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  }
}

exports.default = Account
