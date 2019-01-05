import fs from 'fs'
import path from 'path'
import YAML from 'js-yaml'

import logger from '../utils/debug'
import ErrorResponse from '../utils/error-response'
import { error, p } from '../utils/print-tools'

const { warn, info } = logger('settings')

export default class Settings {
  attributes: any
  configPath: string | null
  baseDir: string
  name: string | null
  loaded: boolean

  constructor () {
    this.configPath = null
    this.baseDir = '.'
    this.name = null
    this.loaded = false
    this.attributes = {}
  }

  load () {
    this.configPath = path.join(this.baseDir, `${this.name}.yml`)

    try {
      fs.accessSync(this.baseDir)
    } catch (err) {
      return false
    }

    info(`loading: ${this.name} - ${this.configPath}`)

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
      process.exit(1)
    }

    return true
  }

  save () {
    info('save()', this.configPath)
    try {
      fs.writeFileSync(this.configPath, YAML.dump(this.attributes))
    } catch (err) {
      // TODO: handle error here
      // return new ErrorResponse(this).handle(err)
    }
  }

  get (key: string) {
    return this.attributes[key] || null
  }

  set (key: any, value: any, save: boolean) {
    this.attributes[key] = value
    if (save !== false) this.save()
    return this
  }
}
