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
class Channel extends _queryBuilder2.default {
  url() {
    const {instanceName} = this.instance

    return `${this._getInstanceURL(instanceName)}/channels/default/publish/`
  }

  /**
   * Publish to channel
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * const instance = await channel.publish('room_name', payload={})
   */
  publish(room, payload) {
    const fetch = this.fetch.bind(this)

    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        body: JSON.stringify({room, payload})
      }
      fetch(this.url(), options)
        .then(resolve)
        .catch(reject)
    })
  }
}

exports.default = Channel
