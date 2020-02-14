import Syncano from '@syncano/core'
import format from 'chalk'
import mkdirp from 'mkdirp'
import path from 'path'

import {getSettings} from '../settings'
import {Location, SyncanoProject} from '../types'

import logger from './debug'
import Hosting from './hosting'
import Init from './init'
import Plugins from './plugins'
import {echo} from './print-tools'
import Socket from './sockets'
import genUniqueName from './unique-instance'

const {debug} = logger('utils-session')

const LOCATIONS = {
  us1: 'api.syncano.io',
  eu1: 'api-eu1.syncano.io'
}

export class Session {
  static findProjectPath() {
    return process.cwd()
  }
  CLIVersion: string
  settings: any
  projectPath: string | null = null
  project: SyncanoProject | null = null
  userId: number | null = null
  userEmail: string | null = null
  userFirstName: string | null = null
  userLastName: string | null = null
  majorVersion: string
  location: Location = 'us1'
  connection: Syncano | null = null

  constructor() {
    // FIXME:
    // const pjson = require('../../package.json')
    const pjson = {
      version: '0.0.1'
    }
    this.CLIVersion = pjson.version
    this.majorVersion = pjson.version.split('.')[0]

    this.location = process.env.SYNCANO_PROJECT_INSTANCE_LOCATION as Location || this.location
    this.settings = getSettings()
  }

  getHost() {
    return process.env.SYNCANO_HOST || LOCATIONS[this.location]
  }

  async setLocation(location: Location) {
    if (this.location !== location) {
      this.location = location
      await this.createConnection()
    }
  }

  getUserEmail() {
    return this.userEmail
  }

  getLocation() {
    return this.location
  }

  getFullName() {
    return `${this.userFirstName} ${this.userLastName}`
  }

  getSpaceHost() {
    if (this.project) {
      if (this.getHost() === 'api.syncano.rocks') {
        return `${this.project.instance}.syncano.link`
      }
      if (this.project && this.project.instance) {
        if (this.location === 'us1') {
          return `${this.project.instance}.syncano.space`
        }
        return `${this.project.instance}.${this.location}.syncano.space`
      }
    }
    throw new Error('Project is not initiated or there is no project!')
  }

  getInitInstance() {
    return new Init()
  }

  getPluginsInstance() {
    return new Plugins()
  }

  getBaseURL() {
    return `https://${this.getHost()}`
  }

  getDistPath() {
    let distPath = '.dist'
    distPath = path.join(this.getProjectPath(), '.dist')
    mkdirp.sync(distPath)
    return distPath
  }

  getBuildPath() {
    const buildPath = path.join(this.getProjectPath(), '.build')
    mkdirp.sync(buildPath)
    return buildPath
  }

  getAnonymousConnection() {
    return new Syncano({
      meta: {
        api_host: this.getHost()
      }
    })
  }

  getConnection() {
    if (this.connection) return this.connection
    throw Error('Session is not connected!')
  }

  getProjectPath() {
    if (this.projectPath) return this.projectPath
    throw Error('Project path is unknown!')
  }

  getProjectInstance() {
    if (this.project && this.project.instance) {
      return this.project.instance
    }
    throw Error('Unknown projewct instance!')
  }

  async createConnection() {
    debug('createConnection')
    if (this.settings.account.authenticated()) {
      debug('user is authenticated')
      this.connection = new Syncano({
        accountKey: this.settings.account.getAuthKey(),
        meta: {
          api_host: this.getHost()
        }
      })

      if (this.project && this.project.instance) {
        this.connection = new Syncano({
          instanceName: this.project.instance,
          accountKey: this.settings.account.getAuthKey(),
          meta: {
            api_host: this.getHost()
          }
        })
      }
    } else {
      this.connection = this.getAnonymousConnection()
    }

    try {
      debug('get user details')
      const details = await this.getConnection().account.get(this.settings.account.getAuthKey())
      this.userId = details.id
      this.userEmail = details.email
      this.userFirstName = details.first_name
      this.userLastName = details.last_name
    } catch (err) {
      debug('Error while getting user details!')
    }
  }

  async deleteInstance(name: string) {
    return this.getConnection().instance.delete(name)
  }

  async createInstance(name = genUniqueName()) {
    return this.getConnection().instance.create({name})
  }

  async getInstance(instanceName: string) {
    const instanceNameToGet = instanceName || (this.project && this.project.instance)
    if (instanceNameToGet) {
      return this.getConnection().instance.get(instanceNameToGet)
    }
    throw Error('Can\'t get instance!')
  }

  async getInstances() {
    return this.getConnection().instance.list()
  }

  async checkAuth() {
    const userDetails = await this.getConnection().account.get(this.settings.account.getAuthKey())
    if (userDetails) {
      return userDetails
    } else {
      throw new Error('No such user!')
    }
  }

  async load() {
    debug('load')

    // Checking all folders up
    try {
      const projectPath = await Session.findProjectPath()
      debug('Searching for syncano.yml', projectPath)
      this.projectPath = projectPath
      this.settings = getSettings(projectPath)
      this.project = this.settings.account.getProject(this.projectPath)
      if (this.project && this.project.location) {
        await this.setLocation(this.project.location)
      }
    } catch (err) {
      this.settings = getSettings()
    }

    await this.createConnection()
    return this
  }

  // loadPlugins(program: CommanderStatic, context: CLIContext) {
  //   new Plugins().load(program, context)
  // }

  isAuthenticated() {
    if (!this.settings.account.authenticated()) {
      echo()
      echo(4)('You are not logged in!')
      echo(4)(`Type ${format.cyan('npx s login')} for login to your account.`)
      echo()
      return false
    }
    return true
  }

  isAuthenticatedToInit() {
    if (!this.settings.account.authenticated()) {
      echo()
      echo(4)(format.red('You have to be a logged in to be able an initialize a new project!'))
      echo()
    }
  }

  async checkConnection(instanceName: string = this.project.instance) {
    debug('checkConnection')
    let instance

    try {
      instance = await this.getInstance(instanceName)
    } catch (err) {
      debug(err.message)
      if (err.message.match(/not found/)) {
        echo()
        echo(4)(`Instance ${format.cyan(instanceName)} was not found on your account!`)
        echo()

        if (instanceName) return false

        echo(4)(`Type ${format.cyan('npx s attach')} to choose one of the existing instances.`)
        echo()
      }
      return false
    }

    return instance
  }

  hasProject() {
    this.hasProjectPath()

    if (!this.project) {
      echo()
      echo(4)('You have to attach this project to one of your instances.')
      echo(4)(`Try ${format.cyan('npx s attach')}.`)
      echo()
      return false
    }
    return true
  }

  hasProjectPath() {
    if (!this.projectPath) {
      echo()
      echo(4)(`I don't see any project here. Try ${format.cyan('npx s init')}.`)
      echo()
      return false
    }
    return true
  }

  hasSocket(socketName: string) { // eslint-disable-line class-methods-use-this
    const socket = new Socket(socketName)
    if (!socket.existLocally) {
      echo()
      echo(4)('File socket.yml was not found in a project directory!')
      echo(4)(`Check your directory or try ${format.cyan('npx s create')} to create a new Socket.`)
      echo()
      return false
    }
    return true
  }

  notAlreadyInitialized() {
    if (this.projectPath && this.project) {
      echo()
      echo(4)('Project in this folder is already initiated!')
      echo(4)(`It is attached to ${format.cyan(this.project.instance)} Syncano instance.`)
      echo()
      return false
    }
    return true
  }

  async deployProject() { // eslint-disable-line class-methods-use-this
    const hostings = await Hosting.list()
    return Promise.all(hostings.map(hosting => hosting.deploy()))
  }
}

export default new Session()
