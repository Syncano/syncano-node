import fs from 'fs'
import path from 'path'
import YAML from 'js-yaml'

import logger from '../utils/debug'
import ErrorResponse from '../utils/error-response'
import { error, p } from '../utils/print-tools'

const { warn, info, debug } = logger('settings')

export default class Settings {
  constructor () {
    this.attributes = {}
    this.configPath = null
  }

  load () {
    this.configPath = path.join(this.baseDir, `${this.name}.yml`)

    try {
      fs.accessSync(this.baseDir)
    } catch (err) {
      return false
    }

    info(`Loading ${this.name} - ${this.configPath}`)

    try {
      info(`Checking: ${this.configPath}`)
      fs.accessSync(this.configPath, fs.R_OK)
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
    debug(`Saving ${this.configPath}`)
    try {
      fs.writeFileSync(this.configPath, YAML.dump(this.attributes))
    } catch (err) {
      return new ErrorResponse(this).handle(err)
    }
  }

  get (key) {
    return this.attributes[key] || null
  }

  set (key, value, save) {
    this.attributes[key] = value
    if (save !== false) this.save()
    return this
  }
}
