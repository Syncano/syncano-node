'use strict'

var log = require('debug')('condition')
var spawn = require('cross-spawn')
var join = require('path').join
var safeEnv = require('safe-env')

function isToken (key) {
  return key.toLowerCase().indexOf('token') !== -1
}

module.exports = function conditionCircle (pluginConfig, weather, cb) {
  var env = weather.env
  var options = weather.options
  log('verifying conditions on circle')
  log('need environment variables CIRCLECI and CIRCLE_BRANCH')
  log(safeEnv(isToken, options))

  function success () {
    log('success')
    return cb(null)
  }

  function failure (message) {
    log('failure', message)
    return cb(new Error(message))
  }

  var script = join(__dirname, '../refs.sh')
  spawn.sync(script, [], { stdio: 'inherit' })

  if (env.CIRCLECI !== 'true') {
    return failure('Missing env.CIRCLECI variable')
  }

  return success()
}
