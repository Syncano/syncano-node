import fs from 'fs'
import YAML from 'js-yaml'
import path from 'path'

import logger from '../utils/debug'
import {error, p} from '../utils/print-tools'

const {warn, info} = logger('settings')

export default class Settings {
  attributes: any
  configPath: string | null = null
  baseDir: string | null = null
  name: string | null = null
  loaded: boolean = false

  constructor() {
    this.configPath = null
    this.baseDir = '.'
    this.name = null
    this.loaded = false
    this.attributes = {}
  }

  getBaseDir() {
    if (this.baseDir) return this.baseDir
    throw new Error ('No base dir!')
  }

  getConfigPath() {
    if (this.configPath) return this.configPath
    throw new Error ('No config path!')
  }

  load() {
    this.configPath = path.join(this.getBaseDir(), `${this.name}.yml`)

    try {
      fs.accessSync(this.getBaseDir())
    } catch (err) {
      return false
    }

    info(`loading: ${this.name} - ${this.getConfigPath()}`)

    try {
      fs.accessSync(this.configPath, fs.constants.R_OK)
    } catch (err) {
      warn('Config doesn\'t exist!')
      return false
    }

    try {
      this.attributes = YAML.load(fs.readFileSync(this.configPath, 'utf8')) || {}
    } catch (err) {
      error(err, p(10)(`at file: ${this.configPath}`))
      // this.exit(1)
    }

    return true
  }

  save() {
    info('save()', this.configPath)
    try {
      fs.writeFileSync(this.getConfigPath(), YAML.dump(this.attributes))
    } catch (err) {
      // TODO: handle error here
      // return new ErrorResponse(this).handle(err)
    }
  }

  get(key: string) {
    return this.attributes[key] || null
  }

  set(key: any, value: any, save?: boolean) {
    this.attributes[key] = value
    if (save !== false) this.save()
    return this
  }
}
