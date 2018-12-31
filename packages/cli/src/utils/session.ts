import Syncano from '@syncano/core'
import format from 'chalk'
import path from 'path'
import mkdirp from 'mkdirp'
// import Promise from 'bluebird'

import logger from './debug'
import getSettings from '../settings'
import genUniqueName from './unique-instance'
import Socket from './sockets'
import Init from './init'
import Hosting from './hosting'
import Plugins from './plugins'
import { echo } from './print-tools'

import {CLISession, SyncanoProject, SyncanoConnection, Location, CLIContext} from '../types'
import { CommanderStatic } from 'commander';

const { debug } = logger('utils-session')

const LOCATIONS = {
  'us1': 'api.syncano.io',
  'eu1': 'api-eu1.syncano.io'
}

export class Session<CLISession> {
  CLIVersion: string
  settings: any
  projectPath: string
  project: SyncanoProject
  userId: number
  userEmail: string
  userFirstName: string
  userLastName: string
  majorVersion: string
  location: Location
  connection: Syncano

  constructor () {
    this.settings = null
    this.projectPath = null
    this.project = null
    this.userId = null

    // TODO: fix this
    // const pjson = require('../../package.json')
    const pjson = {
      version: '0.0.1'
    }
    this.CLIVersion = pjson.version
    this.majorVersion = pjson.version.split('.')[0]

    this.location = process.env.SYNCANO_PROJECT_INSTANCE_LOCATION as Location || 'us1' as Location  // default location
  }

  getHost () {
    return process.env.SYNCANO_HOST || LOCATIONS[this.location]
  }

  async setLocation (location) {
    if (this.location !== location) {
      this.location = location
      await this.createConnection()
    }
  }

  getLocation () {
    return this.location
  }

  getFullName () {
    return `${this.userFirstName} ${this.userLastName}`
  }

  getSpaceHost () {
    if (this.getHost() === 'api.syncano.rocks') {
      return `${this.project.instance}.syncano.link`
    }
    if (this.project && this.project.instance) {
      return `${this.project.instance}.${this.location}.syncano.space`
    }
  }

  getInitInstance () {
    return new Init()
  }

  getPluginsInstance () {
    return new Plugins()
  }

  getBaseURL () {
    return `https://${this.getHost()}`
  }

  getDistPath () {
    let distPath = '.dist'
    if (this.projectPath) {
      distPath = path.join(this.projectPath, '.dist')
    }
    mkdirp.sync(distPath)
    return distPath
  }

  getBuildPath () {
    const buildPath = path.join(this.projectPath, '.build')
    mkdirp.sync(buildPath)
    return buildPath
  }

  getAnonymousConnection () {
    return new Syncano({
      meta: {
        'api_host': this.getHost()
      }
    })
  }

  async createConnection () {
    debug('createConnection')
    if (this.settings.account.authenticated()) {
      debug('user is authenticated')
      this.connection = new Syncano({
        accountKey: this.settings.account.getAuthKey(),
        meta: {
          'api_host': this.getHost()
        }
      })

      if (this.project && this.project.instance) {
        this.connection = new Syncano({
          instanceName: this.project.instance,
          accountKey: this.settings.account.getAuthKey(),
          meta: {
            'api_host': this.getHost()
          }
        })
      }
    } else {
      this.connection = this.getAnonymousConnection()
    }

    try {
      debug('get user details')
      const details = await this.connection.account.get(this.settings.account.getAuthKey())
      this.userId = details.id
      this.userEmail = details.email
      this.userFirstName = details.first_name
      this.userLastName = details.last_name
    } catch (err) {}
  }

  async deleteInstance (name: string) {
    return this.connection.instance.delete(name)
  }

  async createInstance (name = genUniqueName()) {
    return this.connection.instance.create({ name })
  }

  async getInstance (instanceName: string) {
    const instanceNameToGet = instanceName || (this.project && this.project.instance)
    return this.connection.instance.get(instanceNameToGet)
  }

  async getInstances () {
    return this.connection.instance.list()
  }

  async checkAuth () {
    const userDetails = await this.connection.account.get(this.settings.account.getAuthKey())
    if (userDetails) {
      return userDetails
    } else {
      throw new Error('No such user!')
    }
  }

  static findProjectPath () {
    return process.cwd()
  }

  async load () {
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

  loadPlugins (program: CommanderStatic, context: CLIContext) {
    new Plugins().load(program, context)
  }

  isAuthenticated () {
    if (!this.settings.account.authenticated()) {
      echo()
      echo(4)('You are not logged in!')
      echo(4)(`Type ${format.cyan('npx s login')} for login to your account.`)
      echo()
      process.exit(1)
    }
  }

  isAuthenticatedToInit () {
    if (!this.settings.account.authenticated()) {
      echo()
      echo(4)(format.red('You have to be a logged in to be able an initialize a new project!'))
      echo()
    }
  }

  async checkConnection (instanceName?: string) {
    let instance

    try {
      instance = await this.getInstance(instanceName)
    } catch (err) {
      debug(err.message)
      if (err.message === 'Not found.') {
        echo()
        echo(4)(`Instance ${format.cyan(instanceName || this.project.instance)} was not found on your account!`)
        echo()

        if (instanceName) return process.exit()

        echo(4)(`Type ${format.cyan('npx s attach')} to choose one of the existing instances.`)
        echo()
      }
      process.exit(1)
    }

    return instance
  }

  hasProject () {
    this.hasProjectPath()

    if (!this.project) {
      echo()
      echo(4)('You have to attach this project to one of your instances.')
      echo(4)(`Try ${format.cyan('npx s attach')}.`)
      echo()
      process.exit()
    }
  }

  hasProjectPath () {
    if (!this.projectPath) {
      echo()
      echo(4)(`I don't see any project here. Try ${format.cyan('npx s init')}.`)
      echo()
      process.exit()
    }
  }

  hasSocket (socketName: string) { // eslint-disable-line class-methods-use-this
    const socket = new Socket(socketName)
    if (!socket.existLocally) {
      echo()
      echo(4)('File socket.yml was not found in a project directory!')
      echo(4)(`Check your directory or try ${format.cyan('npx s create')} to create a new Socket.`)
      echo()
      process.exit()
    }
  }

  notAlreadyInitialized () {
    if (this.projectPath && this.project) {
      echo()
      echo(4)('Project in this folder is already initiated!')
      echo(4)(`It is attached to ${format.cyan(this.project.instance)} Syncano instance.`)
      echo()
      process.exit()
    }
  }

  async deployProject () { // eslint-disable-line class-methods-use-this
    const hostings = await Hosting.list() as any
    return Promise.all(hostings.map((hosting) => hosting.deploy()))
  }
}

export default new Session()
