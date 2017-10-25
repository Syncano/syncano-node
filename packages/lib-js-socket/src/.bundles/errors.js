'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.SyncanoError = SyncanoError
exports.NotFoundError = NotFoundError
function SyncanoError(message) {
  this.name = 'SyncanoError'
  this.message = message || ''
  this.stack = new Error().stack
}

SyncanoError.prototype = Object.create(Error.prototype)
SyncanoError.prototype.constructor = SyncanoError

function NotFoundError(message = 'No results for given query.') {
  this.name = 'NotFoundError'
  this.message = message
  this.stack = new Error().stack
}

NotFoundError.prototype = Object.create(SyncanoError.prototype)
NotFoundError.prototype.constructor = SyncanoError
