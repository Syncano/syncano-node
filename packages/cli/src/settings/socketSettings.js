import path from 'path'
import semver from 'semver'
import FindKey from 'find-key'

import logger from '../utils/debug'
import Settings from './settings'

const { debug } = logger('setting-socket')

class SocketSettings extends Settings {
  constructor (socketPath, socketName) {
    debug('SocketSettings.constructor', socketPath, socketName)
    super()
    this.name = 'socket'
    this.baseDir = socketPath
    this.loaded = this.load()
    this.attributes.version = this.readVersion()
  }

  readVersion () {
    const pjson = require(`${path.join(this.baseDir, 'package.json')}`)
    return pjson.version
  }

  getScripts () {
    return FindKey(this.attributes, 'file')
  }

  getFileForEndpoint (endpointName) {
    return this.attributes.endpoints[endpointName].file
  }

  getConfigOptions () {
    return this.attributes.config || {}
  }

  getConfig () {
    const config = {}
    const configMetadata = this.getConfigOptions()
    Object.keys(configMetadata).forEach((key) => {
      if (configMetadata[key].value) {
        config[key] = configMetadata[key].default
      }
    })
    return config
  }

  getFull () {
    return this.attributes
  }

  getVersion () {
    return this.attributes.version || '0.0.0'
  }

  bumpVersion (bumpType) {
    const newVersion = semver.inc(this.getVersion(), bumpType)
    debug('newVersion', this.getVersion(), bumpType, newVersion)
    this.set('version', newVersion, true)
    return this.getVersion()
  }
}

export default function getSocketSettings (socketPath, socketName) {
  return new SocketSettings(socketPath, socketName)
}
