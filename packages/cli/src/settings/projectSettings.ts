import _ from 'lodash'
import readdirp from 'readdirp'
import YAML from 'js-yaml'
import fs from 'fs'

import logger from '../utils/debug'
import Settings from './settings'
import {ProjectSettingsAttributes, HostingRecord} from '../types'

const { debug } = logger('settings-project')

export default class ProjectSettings extends Settings {
  attributes: ProjectSettingsAttributes

  constructor (projectPath: string) {
    super()
    this.attributes = {}
    this.name = 'syncano'
    this.baseDir = projectPath
    if (projectPath) {
      this.loaded = this.load()
    }
  }

  getPlugins () {
    return this.attributes.plugins
  }

  getAllSocketsYmlPath () {
    return new Promise((resolve, reject) => {
      const paths = [] as string[]
      readdirp({ root: this.baseDir, fileFilter: 'socket.yml' }, () => {}, () => {})
        .on('data', (entry: any) => {
          paths.push(entry.fullPath)
        })
        .on('end', () => {
          resolve(paths)
        })
        .on('error', (err: Error) => {
          reject(err)
        })
    })
  }

  static getAttributesFromYaml (path: string) {
    const socketAttributes = YAML.load(fs.readFileSync(path, 'utf8'))

    return socketAttributes
  }

  getSocketTemplates () {
    try {
      return this.attributes.templates.sockets
    } catch (err) {
      return []
    }
  }

  // Hosting
  getHosting (hostingName: string) {
    debug('getHosting()')
    return this.attributes.hosting ? this.attributes.hosting[hostingName] : null
  }

  addHosting (hostingName: string, params: HostingRecord) {
    if (!this.attributes.hosting) this.attributes.hosting = {}
    this.attributes.hosting[hostingName] = params
    this.save()
  }

  updateHosting (hostingName: string, params: HostingRecord) {
    if (!this.attributes.hosting) this.attributes.hosting = {}
    this.attributes.hosting[hostingName] = _.extend(this.attributes.hosting[hostingName], params)
    this.save()
  }

  deleteHosting (hostingName: string) {
    if (this.attributes.hosting) {
      delete this.attributes.hosting[hostingName]
    }

    if (this.listHosting().length === 0) {
      delete this.attributes.hosting
    }
    this.save()
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
}
