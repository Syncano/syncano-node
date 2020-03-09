import os from 'os'

import {AccountSettingsAttributes, ProjectSettings, Location} from '../types'
import logger from '../utils/debug'

import Settings from './settings'

const { debug } = logger('settings-account')

export default class AccountSettings extends Settings {
  name: string
  baseDir: string
  loaded: boolean
  attributes: AccountSettingsAttributes

  constructor () {
    super()
    this.name = process.env.SYNCANO_ACCOUNT_FILE ? process.env.SYNCANO_ACCOUNT_FILE : 'syncano'
    this.baseDir = os.homedir()
    this.loaded = this.load()
  }

  logout () {
    debug('logout()')
    delete this.attributes.auth_key
    this.save()
  }

  authenticated () {
    return Boolean(this.getAuthKey())
  }

  getAuthKey () {
    if (process.env.SYNCANO_AUTH_KEY) debug('getAuthKey from process.env')
    else if (this.attributes.auth_key) debug('getAuthKey from syncano.yml')
    else debug('getAuthKey returned null')
    return process.env.SYNCANO_AUTH_KEY || this.attributes.auth_key || null
  }

  addProject (projectPath: string, params: ProjectSettings) {
    debug('addProject()', projectPath)
    if (!this.attributes.projects) {
      this.attributes.projects = {}
    }
    this.attributes.projects[projectPath] = params
    this.save()
  }

  getProject (projectPath: string) {
    debug('getProject()', projectPath)
    const envInstance = process.env.SYNCANO_PROJECT_INSTANCE
    if (envInstance) {
      return {
        instance: envInstance,
        location: process.env.SYNCANO_PROJECT_INSTANCE_LOCATION as unknown as Location
      }
    }
    if (this.attributes.projects) {
      return this.attributes.projects[projectPath]
    }
  }
}
