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
  }

  getHosting (hostingName) {
    debug('getHosting()')
    return this.attributes.hosting ? this.attributes.hosting[hostingName] : null
  }

  addHosting (hostingName, params) {
    if (!this.attributes.hosting) this.attributes.hosting = {}
    this.attributes.hosting[hostingName] = params
  }

  deleteHosting (hostingName) {
    if (this.attributes.hosting) {
      delete this.attributes.hosting[hostingName]
    }

    if (this.listHosting().length === 0) {
      delete this.attributes.hosting
    }
  }

  listHosting () {
    debug('list()')
    const hostings = this.attributes.hosting
    const list = []
    if (hostings) {
      for (const key of Object.keys(hostings)) {
        list.push({
          name: key,
          src: hostings[key].src
        })
      }
    }
    return list
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

  getDependencies () {
    return this.attributes.dependencies || {}
  }

  addDependency (name, version) {
    const deps = this.attributes.dependencies || {}
    deps[name] = { version }
    this.attributes.dependencies = deps
    this.save()
  }
}

export default function getSocketSettings (socketPath, socketName) {
  return new SocketSettings(socketPath, socketName)
}
