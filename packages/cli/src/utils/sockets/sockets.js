import fs from 'fs-extra'
import child from 'child_process'
import FindKey from 'find-key'
import md5 from 'md5'
import hashdirectory from 'hashdirectory'
import unzip from 'unzip2'
import YAML from 'js-yaml'
import axios from 'axios'
import readdirp from 'readdirp'
import mkdirp from 'mkdirp'
import path from 'path'
import FormData from 'form-data'
import archiver from 'archiver'
import Promise from 'bluebird'
import template from 'es6-template-strings'
import _ from 'lodash'
import SourceMap from 'source-map'

import logger from '../debug'
import session from '../session'
import utils from './utils'
import Hosting from '../hosting'
import Registry from '../registry'
import { p, echo } from '../print-tools'
import { getTemplate } from '../../constants/Constants'

const { debug } = logger('utils-sockets')

class MetadataObject {
  constructor (name, metadata, socketName) {
    this.name = name
    this.metadata = metadata
    this.socketName = socketName
    this.existRemotely = null
    this.existLocally = null
    this.isProjectRegistryDependency = null
  }
  getStatus () {
    if (this.existLocally && this.existRemotely) {
      return { status: 'synced', type: 'ok' }
    }

    if (this.existLocally && !this.existRemotely) {
      return { status: 'not synced', type: 'warn' }
    }

    if (!this.existLocally && this.existRemotely) {
      return { status: 'no local configuration', type: 'fail' }
    }
  }
}

class Endpoint extends MetadataObject {
  call (params) {
    return axios.request({
      url: this.getURL(),
      method: 'POST',
      timeout: 3000,
      params,
      // Do not transform data automaticaly
      transformResponse: (data) => data
    })
  }

  getFullName () {
    return `${this.socketName}/${this.name}`
  }

  getURL () {
    return `https://${session.getSpaceHost()}/${this.socketName}/${this.name}/`
  }
}

class Handler extends MetadataObject {}

class Event extends MetadataObject {}

class Socket {
  constructor (socketName, socketPath) {
    debug('Sockets.constructor', socketName)
    this.name = socketName
    this.settings = { loaded: false }
    this.socketPath = socketPath || utils.findLocalPath(socketName)

    if (this.socketPath) {
      this.settings = session.settings.getSocketSettings(this.socketPath, this.name)
    }

    this.existRemotely = null
    this.existLocally = null
    this.isProjectRegistryDependency = null
    this.dependencies = []
    this.dependencyOf = []

    // that looks stupid
    this.remote = { spec: { endpoints: {}, event_handlers: {}, events: {} }, metadata: {} }
    this.spec = { spec: { endpoints: {}, event_handlers: {}, events: {} } }

    this.loadLocal()

    // SocketPath for non-local sockets
    if (this.isDependencySocket || this.isProjectRegistryDependency) {
      this.socketPath = path.join(session.getBuildPath(), this.name)
    }
  }

  static getTemplatesChoices () {
    return utils.getTemplatesChoices()
  }

  // Install / Uninstall
  static add (registrySocket) {
    debug('add()')
    session.settings.project.installSocket(registrySocket)
  }

  // Install / Uninstall
  static async install (registrySocket, config) {
    debug('install()')

    const socketName = registrySocket.name
    session.settings.project.installSocket(registrySocket)

    const socketFolder = path.join(session.getBuildPath(), socketName)
    mkdirp.sync(socketFolder)

    debug('Getting socket from registry')
    await Registry.getSocket(registrySocket, config)

    debug('Registry socket:', registrySocket)
    const fileName = path.join(session.getBuildPath(), `${socketName}.zip`)

    return new Promise((resolve, reject) => {
      fs.createReadStream(fileName)
        .pipe(unzip.Extract({ path: socketFolder }))
        .on('close', async () => {
          debug('Unzip finished')
          try {
            const newSocket = new Socket(socketName, socketFolder)
            await Socket.updateSocketNPMDeps(socketFolder)
            await newSocket.loadRemote()

            const updateStatus = await newSocket.update({ config })
            debug('updateStatus', updateStatus)
            newSocket.updateStatus = updateStatus
            resolve(newSocket)
          } catch (err) {
            reject(err)
          }
        })
    })
  }

  static uninstall (socket = {}) {
    debug('uninstall', socket.name)

    if (socket.isProjectRegistryDependency) {
      session.settings.project.uninstallSocket(socket.name)
    }

    if (socket.existLocally && socket.localPath) {
      Socket.uninstallLocal(socket)
      if (socket.existRemotely) {
        this.uninstallRemote(socket.name)
      }
      return Promise.resolve()
    }

    if (socket.existRemotely) {
      return this.uninstallRemote(socket.name)
    }

    return Promise.reject(new Error('Socket with given doesn\'t exist!'))
  }

  static uninstallLocal (socket) {
    fs.removeSync(socket.localPath)
  }

  // TODO: check if the socket is installed (it may be not yet installed yet (before sync))
  static async uninstallRemote (socketName) {
    debug('uninstallRemote', socketName)
    return session.connection.socket.delete(socketName)
  }

  // list sockets based on call to Syncano (sockets are installed on Synano)
  static listRemote () {
    debug('listRemote()')
    return session.connection.socket.list()
  }

  static listDeps () {
    // List project dependencies
    return Object.keys(session.settings.project.getDependSockets())
  }

  // list all sockets (mix of locally definde and installed on server)
  static async list () {
    debug('list()')
    // Local Socket defined in folders and in project deps
    const localSocketsList = utils.listLocal().concat(Socket.listDeps())
    return Promise.all(localSocketsList.map((socketName) => Socket.get(socketName)))
  }

  static async flatList (socketName) {
    debug('flatList()')
    const sockets = []

    const addToList = (socket) => {
      const duplicated = _.find(sockets, (s) => s.name === socket.name)
      if (duplicated) {
        if (!_.includes(duplicated.dependencyOf, socket.name)) {
          duplicated.dependencyOf.concat(socket.dependencyOf)
        }
      } else {
        sockets.push(socket)
        socket.dependencies.forEach((dep) => {
          addToList(dep)
        })
      }
    }

    if (socketName) {
      const socket = await Socket.get(socketName)
      addToList(socket)
      return sockets
    }

    // All Sockets
    const allSockets = await Socket.list()
    allSockets.forEach((socket) => {
      addToList(socket)
    })
    return sockets
  }

  // Creating Socket simple object
  static getLocal (socketName) {
    return new Socket(socketName)
  }

  static async get (socketName) {
    debug(`Getting Socket: ${socketName}`)
    const socket = Socket.getLocal(socketName)
    const loadedSocket = await socket.loadRemote()
    await loadedSocket.getDepsRegistrySockets()

    if (!socket.existLocally) {
      await socket.loadFromRegistry()
    }
    return socket
  }

  static create (socketName, templateName) {
    debug('create socket', socketName, templateName)
    const newSocketPath = path.join(session.projectPath, socketName)
    const socket = new Socket(socketName, newSocketPath)
    if (socket.existLocally) {
      return Promise.reject(new Error('Socket with given name already exist!'))
    }
    return socket.init(templateName)
  }

  static publish (socketName, version) {
    const registry = new Registry()
    return registry.publishSocket(socketName, version)
  }

  init (templateName) {
    debug('init', templateName)
    return new Promise((resolve, reject) => {
      const socketPath = this.getSocketPath()
      if (!fs.existsSync(socketPath)) {
        mkdirp.sync(socketPath)
      }

      try {
        const templateFolder = path.normalize(getTemplate(templateName))
        const files = fs.walkSync(templateFolder)
        files.forEach((file) => {
          const oldContent = fs.readFileSync(file, 'utf8')
          const socket = {
            socketName: this.name,
            socketDescription: `Description of ${this.name}`
          }

          const newContent = template(oldContent, socket, { partial: true })
          const fileToSave = path.join(socketPath, file.replace(templateFolder, ''))

          mkdirp.sync(path.parse(fileToSave).dir)
          fs.writeFileSync(path.join(socketPath, file.replace(templateFolder, '')), newContent)
        })
        resolve(this)
      } catch (err) {
        return reject(err)
      }
    })
  }

  verify () {
    return new Promise((resolve, reject) => {
      if (!(this.isDependencySocket || this.isProjectRegistryDependency)) {
        if (!fs.existsSync(this.getSrcFolder())) {
          reject(new Error('No src folder!'))
        }
      }
      resolve()
    })
  }

  getFullConfig () {
    return this.settings.getFull()
  }

  async getRemote () {
    debug('getRemote', this.name)
    try {
      return await session.connection.socket.get(this.name)
    } catch (err) {
      return false
    }
  }

  async getRemoteSpec () {
    debug('getRemoteSpec')
    if (this.remote.files['socket.yml']) {
      try {
        const spec = await axios.request({
          url: this.remote.files['socket.yml'].file,
          method: 'GET',
          timeout: 3000
        })
        this.remote.spec = YAML.load(spec.data)
      } catch (err) {}
    }
  }

  setRemoteState (socket) {
    this.existRemotely = true
    this.remote.name = socket.name
    this.remote.environment = socket.environment
    this.remote.version = socket.version
    this.remote.updatedAt = socket.updated_at
    this.remote.installed = socket.installed
    this.remote.files = socket.files
    this.remote.status = socket.status
    this.remote.statusInfo = socket.status_info
    this.remote.config = socket.config
    this.remote.metadata = socket.metadata
  }

  async loadRemote () {
    debug('loadRemote()')
    const socket = await this.getRemote()
    if (socket) {
      await this.setRemoteState(socket)
      await this.getRemoteSpec()
    } else {
      this.existRemotely = false
    }
    return this
  }

  async loadFromRegistry () {
    debug(`loadFromRegistry: ${this.name}`)
    const registry = new Registry()
    const registrySocket = await registry.getFullSocket(this.name)
    this.spec = registrySocket.config
    this.url = registrySocket.url
  }

  loadLocal () {
    debug('loadLocal()')
    if (this.settings.loaded) {
      this.existLocally = true
      this.localPath = this.settings.baseDir
      this.spec = this.settings.getFull()
    } else if (_.includes(Socket.listDeps(), this.name)) {
      this.isProjectRegistryDependency = true
      this.existLocally = false
      this.spec.version = session.settings.project.getDependSocket(this.name).version
    }
  }

  isSocketFile (fileFullPath) {
    debug('isSocketFile', fileFullPath)
    return fileFullPath.includes(this.localPath)
  }

  getRawStatus () {
    return {
      isProjectRegistryDependency: this.isProjectRegistryDependency,
      existRemotely: this.existRemotely,
      existLocally: this.existLocally
    }
  }

  getStatus () {
    if (this.isProjectRegistryDependency && !this.existRemotely) {
      return { status: 'not synced', type: 'warn' }
    }

    if (this.existLocally && !this.existRemotely) {
      return { status: 'not synced', type: 'warn' }
    }

    let msg = this.remote.statusInfo || this.remote.status
    if (msg && msg.error) {
      msg = msg.error
    }

    if (this.remote.status === 'ok') {
      return { status: msg, type: 'ok' }
    } else if (this.remote.status === 'processing') {
      return { status: msg, type: 'warn' }
    }
    return { status: msg, type: 'fail' }
  }

  getType () {
    if (this.isProjectRegistryDependency) {
      return { msg: 'project dependency', type: 'ok' }
    }

    if (this.isDependencySocket) {
      return { msg: `dependency of ${this.dependencyOf.join(', ')}`, type: 'ok' }
    }

    if (this.existLocally) {
      return { msg: 'local Socket', type: 'ok' }
    }

    return { msg: 'no local configuration', type: 'warn' }
  }

  getVersion () {
    return this.remote ? this.remote.version : null
  }

  getScripts () {
    return FindKey(this.spec, 'file')
  }

  getSrcFolder () {
    return path.join(this.getSocketPath(), 'src', path.sep)
  }

  getCompiledScriptsFolder () {
    const folder = path.join(this.getSocketPath(), '.dist', 'src', path.sep)
    if (!fs.existsSync(folder)) {
      mkdirp.sync(folder)
    }
    return folder
  }

  getSocketZip () {
    debug('getSocketZip')
    return path.join(session.getDistPath(), `${this.name}.zip`)
  }

  getSocketEnvZip () {
    debug('getSocketEnvZip')
    return path.join(session.getDistPath(), `${this.name}.env.zip`)
  }

  getSocketNodeModulesChecksum () {
    debug('getSocketNodeModulesChecksum')
    return hashdirectory.sync(path.join(this.socketPath, '.dist', 'node_modules'))
  }

  getSocketConfigFile () {
    return path.join(session.projectPath, this.name, 'socket.yml')
  }

  composeFromSpec (objectType, ObjectClass) {
    debug('composeFromSpec', objectType, ObjectClass)
    const objects = Object.assign({}, this.remote.spec[objectType])
    Object.assign(objects, this.spec[objectType])

    debug('objects to process', objects)
    return Object.keys(objects).map((objectName) => {
      debug(`checking ${objectName}`)
      const objectMetadata = objects[objectName]
      debug('objectMetadata', objectMetadata)
      const object = new ObjectClass(objectName, objectMetadata, this.name)

      debug('existRemotely', this.remote.spec[objectType], objectName)
      if (this.remote.spec[objectType][objectName]) {
        debug(`existRemotely: ${true}`)
        object.existRemotely = true
      }

      if (this.spec[objectType] && this.spec[objectType][objectName]) {
        object.existLocally = true
      }
      return object
    })
  }

  getEndpoints () {
    debug('getEndpoints')
    return this.composeFromSpec('endpoints', Endpoint)
  }

  getEndpoint (endpointName) {
    debug('getEndpoints')
    return _.find(this.getEndpoints(), { name: endpointName })
  }

  getEventHandlers () {
    debug('getEventHandlers')
    return this.composeFromSpec('event_handlers', Handler)
  }

  getEvents () {
    debug('getEvents')
    return this.composeFromSpec('events', Event)
  }

  getEndpointTrace (endpointName, traceId) {
    return session.connection.trace.get(this.name, endpointName, traceId)
  }

  async getEndpointTraces (endpointName, lastId) {
    debug('getEndpointTraces', endpointName, lastId)
    try {
      const traces = await session.connection.trace.get(this.name, endpointName)
      if (!lastId) {
        return traces
      }
      const filteredTraces = []
      traces.forEach((trace) => {
        if (trace.id > lastId) {
          filteredTraces.push(trace)
        }
      })
      return filteredTraces
    } catch (err) {}
  }

  getTraces (lastId) {
    const params = { room: `socket:${this.name}` }
    if (lastId) {
      params.last_id = lastId
    }

    return axios.request({
      url: `https://${session.getHost()}/v2/instances/${session.project.instance}/channels/eventlog/poll/`,
      method: 'GET',
      timeout: 50000,
      params,
      headers: {
        'X-Api-Key': session.settings.account.getAuthKey()
      }
    })
  }

  static getEndpointTraceByUrl (url) {
    const resp = axios.request({
      url: `https://${session.getHost()}${url}`,
      method: 'GET',
      headers: {
        'X-Api-Key': session.settings.account.getAuthKey()
      }
    })
    return resp.data
  }

  async createZip ({ plainSources = false } = {}) {
    debug('createZip')
    return new Promise((resolve, reject) => {
      let numberOfFiles = 0
      const allFilesList = []

      const archive = archiver('zip', { zlib: { level: 9 } })
      const output = fs.createWriteStream(this.getSocketZip(), { mode: 0o700 })

      archive.pipe(output)
      archive.on('error', reject)

      function fileFilter (file) {
        const remoteFiles = this.remote.files
        if (file.fullPath.match(/yarn\.lock/)) { return false }
        if (file.fullPath.match(/.*\.log$/)) { return false }
        if (file.fullPath.match(/node_modules/)) { return false }
        if (file.fullPath.match(/\.js\.map$/)) { return false }
        if (!plainSources && file.fullPath.match(/\.js$/)) { return false }
        if (file.fullPath.match(/\.js$/)) { return false }
        if (file.path.match(/^\./)) { return false }
        debug(`createZip: Checking file ${file.name}`)
        if (remoteFiles) {
          const remoteFile = remoteFiles[file.path]
          if (remoteFile) {
            return remoteFile.checksum !== md5(fs.readFileSync(file.fullPath))
          }
          return true
        }
        return true
      }

      const findFiles = readdirp({ root: this.getSrcFolder(), fileFilter: fileFilter.bind(this) })

      // Adding socket.yml if needed
      const localYMLChecksum = md5(fs.readFileSync(this.getSocketYMLFile()))
      const remoteYMLChecksum = this.remote.files && this.remote.files['socket.yml']
        ? this.remote.files['socket.yml'].checksum
        : ''
      if (remoteYMLChecksum !== localYMLChecksum) {
        debug('Adding file to archive: \'socket.yml\'')
        archive.file(this.getSocketYMLFile(), { name: 'socket.yml' })
        allFilesList.push('socket.yml')
        numberOfFiles += 1
      } else {
        debug('Ignoring file: socket.yml')
      }

      // Adding all files (besides those filtered out)
      findFiles.on('data', (file) => {
        // with "internal" path
        const fileNameWithPath = file.fullPath.replace(`${this.getSrcFolder()}`, '')
        debug(`Adding file to archive: ${fileNameWithPath}`)
        archive.file(file.fullPath, { name: fileNameWithPath })
        allFilesList.push(fileNameWithPath)
        numberOfFiles += 1
      })

      findFiles.on('end', async () => {
        if (!plainSources) {
          const scripts = await this.getScriptsInSocket()
          scripts.forEach((script) => {
            const scriptNameWithPath = script.srcFile.replace(`${this.getSrcFolder()}`, '')
            const scriptBundlePath = script.compiledFile
            const remoteFile = this.remote.files ? this.remote.files[scriptNameWithPath] : null

            allFilesList.push(scriptNameWithPath)

            if (remoteFile) {
              if (!fs.existsSync(scriptBundlePath)) {
                return
              }
              const scriptLocalChecksum = md5(fs.readFileSync(scriptBundlePath))
              const scriptRemoteChecksum = remoteFile.checksum
              if (scriptLocalChecksum === scriptRemoteChecksum) {
                debug('Ignoring file:', scriptNameWithPath)
                return
              }
            }

            debug(`Adding file to archive: ${scriptNameWithPath}`)
            archive.file(scriptBundlePath, { name: scriptNameWithPath })
            numberOfFiles += 1
          })
          debug(`createZip: all files processed: ${numberOfFiles}`)
        }
        archive.finalize()
      })

      output.on('close', () => {
        resolve({ numberOfFiles, allFilesList })
      })
    })
  }

  createPackageZip () {
    debug('createPackageZip')
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } })
      const output = fs.createWriteStream(this.getSocketZip(), { mode: 0o700 })

      archive.pipe(output)
      archive.on('error', reject)

      archive.file(this.getSocketYMLFile(), { name: 'socket.yml' })
      archive.file(path.join(this.getSocketPath(), 'package.json'), { name: 'package.json' })
      archive.directory(this.getSrcFolder(), 'src')
      archive.finalize()

      output.on('close', () => {
        resolve()
      })
    })
  }

  createEnvZip () {
    debug('createEnvZip')
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(this.getSocketEnvZip(), { mode: 0o700 })
      const archive = archiver('zip', { zlib: { level: 9 } })

      const envFolder = path.join(this.getSocketPath(), '.dist', 'node_modules')

      if (!fs.existsSync(envFolder)) {
        mkdirp.sync(envFolder)
      }

      archive.pipe(output)
      archive.on('error', reject)

      archive.directory(envFolder, 'node_modules')

      archive.finalize()
      output.on('close', () => {
        resolve()
      })
    })
  }

  updateEnvCall (method) {
    return new Promise((resolve, reject) => {
      const form = new FormData()

      let endpointPath = `/v2/instances/${session.project.instance}/environments/`
      if (method === 'PATCH') {
        endpointPath = `/v2/instances/${session.project.instance}/environments/${this.name}/`
      }

      debug('endpointPath', endpointPath)
      form.append('name', this.name)
      form.append('metadata', JSON.stringify({ checksum: this.getSocketNodeModulesChecksum() }))
      form.append('zip_file', fs.createReadStream(this.getSocketEnvZip()))
      debug('upload env zip')
      form.submit({
        method,
        protocol: 'https:',
        host: session.getHost(),
        headers: {
          'X-Api-Key': session.settings.account.getAuthKey()
        },
        path: endpointPath

      }, (err, res) => {
        debug('end env upload')
        if (res.statusCode === 200) {
          resolve()
        }

        if (res.statusCode === 413) {
          debug('error while updating environment - environment is to big :(')
          return reject(new Error('environment is to big'))
        }

        if (err || res.statusCode === 404) {
          debug(`environment ${this.name} was not found`)
          return reject(err || res)
        }

        res.on('data', (data) => {
          const message = data.toString()

          if (res.statusCode > 299) {
            debug(`error while updating environment (${res.statusCode})`)
            return reject(message)
          }

          debug(`environment ${this.name} was found`)
          resolve(message)
        })
      })
    })
  }

  async updateEnv () {
    debug('updateEnv')
    const resp = await this.socketEnvShouldBeUpdated()
    if (resp) {
      await this.createEnvZip()
      return this.updateEnvCall(resp)
    }
    return 'No need to update'
  }

  postSocketZip (config) {
    return this.zipCallback({ config, install: true })
  }

  patchSocketZip (config) {
    return this.zipCallback({ config, install: false })
  }

  async zipCallback ({ config, install = false }) {
    debug('zipCallback')
    let endpointPath = `/v2/instances/${session.project.instance}/sockets/`

    if (!install) {
      endpointPath += `${this.name}/`
    }

    const { numberOfFiles, allFilesList } = await this.createZip()
    if (numberOfFiles === 0 && this.isConfigSynced) {
      debug('config is synced and nothing to update')
      return Promise.resolve()
    }
    debug('preparing update')

    return new Promise((resolve, reject) => {
      const form = new FormData()

      form.append('name', this.name)
      form.append('environment', this.name)

      if (config) {
        form.append('config', JSON.stringify(config))
      }

      const metadata = Object.assign({}, this.remote.metadata, { sources: this.getSocketSrcChecksum() })
      form.append('metadata', JSON.stringify(metadata))

      form.append('zip_file_list', JSON.stringify(allFilesList))
      if (numberOfFiles > 0) {
        form.append('zip_file', fs.createReadStream(this.getSocketZip()))
      }

      form.submit({
        method: install ? 'POST' : 'PATCH',
        protocol: 'https:',
        host: session.getHost(),
        headers: {
          'X-Api-Key': session.settings.account.getAuthKey()
        },
        path: endpointPath

      }, (err, res) => {
        debug('end upload')
        let responseData = ''
        let responseCode = ''
        res.on('data', (data) => {
          responseData += data.toString()
          responseCode = res.statusCode
        })
        res.on('end', () => {
          if (err || responseCode === 404) {
            debug(`socket ${this.name} was not found`)
            return reject(err || res)
          }

          if (responseCode > 299) {
            debug(`error while updating socket (${res.statusCode})`)
            return reject(responseData)
          }

          debug(`socket ${this.name} was found`)
          resolve(responseData)
        })
      })
    })
  }

  getSocketPath () {
    if (this.isDependencySocket || this.isProjectRegistryDependency) {
      const socketFolder = path.join(session.getBuildPath(), this.name)
      mkdirp.sync(socketFolder)
      return socketFolder
    }
    return this.socketPath
  }

  getSocketYMLFile () {
    return path.join(this.getSocketPath(), 'socket.yml')
  }

  // async preCompileRegistrySocket () {
  //   await Registry.getSocket(this)
  //   const fileName = path.join(session.getBuildPath(), `${this.name}.zip`)
  //
  //   return new Promise((resolve, reject) => {
  //     fs.createReadStream(fileName)
  //       .pipe(unzip.Extract({ path: this.getSocketPath() }))
  //       .on('close', () => {
  //         debug('Unzip finished')
  //         resolve(this.compile())
  //       })
  //   })
  // }

  compile (params = { updateSocketNPMDeps: false }) {
    debug(`compile: ${this.name}`)
    debug(`compile socketPath: ${this.getSocketPath()}`)

    return new Promise(async (resolve, reject) => {
      let command = null
      if (this.isDependencySocket || this.isProjectRegistryDependency) {
        await Registry.getSocket(this)
        const fileName = path.join(session.getBuildPath(), `${this.name}.zip`)

        await new Promise((resolve, reject) => {
          fs.createReadStream(fileName)
            .pipe(unzip.Extract({ path: this.getSocketPath() }))
            .on('close', () => {
              debug('Unzip finished')
              resolve()
            })
        })
      }
      if (params.updateSocketNPMDeps) {
        command = 'npm run build'
      } else {
        command = 'npm run build:src'
      }

      child.exec(command, { cwd: this.getSocketPath(), maxBuffer: 2048 * 1024 }, (err, stdout, stderr) => {
        if (err) {
          console.log('err', err)
          reject(new Error('compile error'))
        } else {
          resolve()
        }
      })
    })
    // let compilation = null
    // if (params.updateSocketNPMDeps) {
    //   if (this.isDependencySocket || this.isProjectRegistryDependency) {
    //     compilation = this.preCompileRegistrySocket()
    //   } else {
    //     compilation = utils.updateSocketNPMDeps(this.getSocketPath())
    //   }
    // } else {
    //   compilation = Promise.resolve()
    // }
    //
    // return compilation
    //   .then((updateSocketDepsStatus) => {
    //     debug('updateSocketDepsStatus', updateSocketDepsStatus)
    //     return compile([this], params.withSourceMaps)
    //   })
  }

  isConfigSynced (config) {
    debug('isConfigSynced')
    return _.isEqual(config, this.remote.config)
  }

  updateConfig (config) {
    if (this.isConfigSynced(config)) {
      return Promise.resolve()
    }
    return axios.request({
      url: `https://${session.getHost()}/v2/instances/${session.project.instance}/sockets/${this.name}/`,
      method: 'PATCH',
      data: { config },
      headers: {
        'X-Api-Key': session.settings.account.getAuthKey()
      }
    })
  }

  async update (params = { config: null, updateSocketNPMDeps: false, updateEnv: false }) {
    debug(`Socket update: ${this.name}`, params)
    const config = Object.assign({}, this.remote.config, params.config)

    // Get options from the env
    if (this.spec.config) {
      Object.keys(this.spec.config).forEach((optionName) => {
        const envValue = this.getConfigOptionFromEnv(optionName)
        if (envValue) {
          debug(`setting value from env for: ${optionName}`)
          config[optionName] = envValue
        }
      })
    }

    await this.verify()
    await this.compile({ updateSocketNPMDeps: params.updateSocketNPMDeps })
    if (params.updateEnv) {
      await this.updateEnv()
    }

    let resp = null
    if (this.existRemotely) {
      resp = await this.patchSocketZip(config)
    }
    resp = await this.postSocketZip(config)

    if (resp && resp.status !== 'ok') return this.waitForStatusInfo()
    return { status: 'stopped' }
  }

  waitForStatusInfo () {
    debug('waitForStatusInfo')

    return new Promise((resolve, reject) => {
      const getStatus = async () => {
        const socket = await this.getRemote()
        if (socket.status !== 'ok' && socket.status !== 'error') {
          setTimeout(getStatus, 200)
        } else {
          this.setRemoteState(socket)
          resolve({ status: socket.status, message: socket.status_info })
        }
      }
      getStatus()
    })
  }

  // Hosting
  addHosting (hostingName, params) {
    this.settings.addHosting(hostingName, params)
    this.settings.save()
  }

  getHosting (hostingName) {
    return Hosting.get(this, hostingName)
  }

  listHostings () {
    return Hosting.list(this)
  }

  deleteHosting (hostingName) {
    this.settings.deleteHosting(hostingName)
    this.settings.save()
    echo()
    echo(4)(`Hosting ${hostingName} of ${this.name} has been deleted from config...`)
  }

  getScriptObject (fileFullPath) {
    const srcFile = fileFullPath
    const compiledFile = fileFullPath.replace(this.getSrcFolder(), this.getCompiledScriptsFolder())
    return {
      srcFile,
      compiledFile
    }
  }

  getScriptsInSocket () {
    debug('getScriptsInSocket')

    return new Promise((resolve, reject) => {
      function fileFilter (file) {
        const fileWithLocalPath = file.fullPath.replace(`${this.getSocketPath()}${path.sep}`, '')
        if (fileWithLocalPath.match(/test/)) { return false }
        if (fileWithLocalPath.match(/tests/)) { return false }
        if (fileWithLocalPath.match(/\.bundles/)) { return false }
        if (fileWithLocalPath.match(/node_modules/)) { return false }
        if (!fileWithLocalPath.match(/\.js$/)) { return false }
        return true
      }

      const findFiles = readdirp({ root: this.getSrcFolder(), fileFilter: fileFilter.bind(this) })
      const files = []
      // Adding all files (besides those filtered out)
      findFiles.on('data', (file) => {
        files.push(this.getScriptObject(file.fullPath))
      })

      findFiles.on('end', () => {
        resolve(files)
      })
    })
  }

  async getScriptsToCompile () {
    debug('getScriptsToCompile')

    const files = await this.getScriptsInSocket()
    const filesToCompile = []
    files.forEach((file) => {
      const fileNameWithLocalPath = file.srcFile.replace(this.getSrcFolder(), '')
      const localSrcChecksum = md5(fs.readFileSync(file.srcFile, 'utf8'))
      const remoteSrcChecksum =
        this.remote.metadata.sources ? this.remote.metadata.sources[fileNameWithLocalPath] : ''

      debug(`Checksums for ${fileNameWithLocalPath}`, localSrcChecksum, remoteSrcChecksum)
      if (localSrcChecksum !== remoteSrcChecksum) {
        filesToCompile.push(file)
      }
    })
    return filesToCompile
  }

  getFileForEndpoint (endpointName) {
    if (endpointName.startsWith('events')) {
      return this.spec.event_handlers[endpointName].file
    }
    return this.spec.endpoints[endpointName].file
  }

  getSourceMapPath (endpointName) {
    const filePath = this.getFileForEndpoint(endpointName)
    const { base, dir } = path.parse(filePath)
    return path.join(
      this.getSocketPath(),
      dir,
      '.bundles',
      `${base}.map`
    )
  }

  getOrigFileLine (traceData, endpointName) {
    const smc = new SourceMap.SourceMapConsumer(
      fs.readFileSync(this.getSourceMapPath(endpointName), { encoding: 'utf-8' })
    )
    return smc.originalPositionFor({
      line: traceData.lineNumber,
      column: traceData.columnNumber
    })
  }

  getPrettyTrace (traceData, endpointName) {
    const origFileLine = this.getOrigFileLine(traceData, endpointName)
    const origFilePath = utils.getOrigFilePath(origFileLine)

    return {
      origFilePath,
      lineNumber: origFileLine.line,
      columnNumber: origFileLine.column,
      lines: [
        fs.readFileSync(
          // origFilePath,
          path.join(this.getSocketPath(), '../', origFilePath),
          { encoding: 'utf-8' }).split('\n')[origFileLine.line - 1],
        p(origFileLine.column)('^')
      ]
    }
  }

  // Config
  getConfigOptions () {
    return this.spec.config
  }

  getConfigOptionFromEnv (optionName) {
    return process.env[`${this.name.toUpperCase()}_${optionName.toUpperCase()}`]
  }

  getConfigOptionsToAsk () {
    // If there is not options in spec it is always no options to ask
    if (!this.spec.config) { return {} }

    const options = {}

    if (this.isDependencySocket || this.isProjectRegistryDependency) {
      if (this.remote.status === 'ok') {
        return options
      }
      Object.keys(this.spec.config).forEach((optionName) => {
        const envValue = this.getConfigOptionFromEnv(optionName)
        const option = this.spec.config[optionName]
        if (option.required && !envValue) {
          options[optionName] = option
        }
      })
      return options
    }

    if (this.existLocally) {
      Object.keys(this.spec.config).forEach((optionName) => {
        const envValue = this.getConfigOptionFromEnv(optionName)
        const option = this.spec.config[optionName]
        if (option.required && !envValue) {
          if (!this.remote.config || !this.remote.config[optionName]) {
            options[optionName] = option
          }
        }
      })
      return options
    }
  }

  // Registry
  bumpVersion (bumpType) {
    const nextVersion = this.settings.bumpVersion(bumpType)
    this.spec.version = nextVersion
    return nextVersion
  }

  submit () {
    debug('submit')
    const registry = new Registry()
    return registry.submitSocket(this)
  }

  // Socket dependencies
  getDeps () {
    return this.settings.getDependencies()
  }

  async getDepsRegistrySockets () {
    debug(`getDepsRegistrySockets for: ${this.name}`)
    const registry = new Registry()

    const getDeepDeps = (deps, socketToAdd) => {
      debug('getDeepDeps', deps)
      const sockets = []
      if (socketToAdd) {
        sockets.push(socketToAdd)
      }
      return Promise.all(sockets.concat(Object.keys(deps).map(async (dependencyName) => {
        debug(`processing dependency: ${dependencyName}`)
        const socket = await registry.searchSocketByName(dependencyName, deps[dependencyName].version)
        socket.dependencyOf = socketToAdd ? socketToAdd.name : this.name

        if (!_.isEmpty(socket.config.dependencies)) {
          return getDeepDeps(socket.config.dependencies, socket)
        }
        debug(`returning socket without dependencies ${socket.name}`)
        return Promise.resolve(socket)
      })))
    }

    debug(`Defined dependencies of "${this.name}" to follow: ${this.spec.dependencies}`)
    if (this.spec.dependencies) {
      const arr = await getDeepDeps(this.spec.dependencies)
      const depsObjects = await Promise.all(_.flatten(arr).map(async socket => {
        const createdSocket = await Socket.get(socket.name)
        createdSocket.isDependencySocket = true
        createdSocket.dependencyOf = [socket.dependencyOf]
        return createdSocket
      }))
      this.dependencies = depsObjects
    }

    return Promise.resolve()
  }

  async addDependency (socketFromRegistry) {
    const socketName = socketFromRegistry.name
    const socketVersion = socketFromRegistry.version
    this.settings.addDependency(socketName, socketVersion)
  }

  async socketEnvShouldBeUpdated () {
    debug('socketEnvShouldBeUpdated')
    try {
      const resp = await axios.request({
        url: `https://${session.getHost()}/v2/instances/${session.project.instance}/environments/${this.name}/`,
        method: 'GET',
        timeout: 50000,
        headers: {
          'X-Api-Key': session.settings.account.getAuthKey()
        }
      })

      if (resp.data.metadata.checksum === this.getSocketNodeModulesChecksum()) {
        debug('socketEnvShouldBeUpdated', 'env is up to date')
        return false
      }
      return 'PATCH'
    } catch (err) {
      return 'POST'
    }
  }

  getSocketSrcChecksum () {
    const files = fs.walkSync(this.getSrcFolder())
    const checksums = {}
    files.forEach((file) => {
      const fileReltivePath = file.replace(this.getSrcFolder(), '')
      checksums[fileReltivePath] = md5(fs.readFileSync(file, 'utf8'))
    })
    return checksums
  }

  shouldBeUpdated () {
    debug('shouldBeUpdated')
    if (this.existLocally && this.existRemotely) {
      const files = this.remote.files
      return Object.keys(files).some((file) => {
        let filePath

        if (file === 'socket.yml') {
          filePath = this.getSocketYMLFile()
        } else if (file.endsWith('.js')) {
          filePath = path.join(this.getCompiledScriptsFolder(), file)
        } else {
          filePath = path.join(this.getSrcFolder(), file)
        }

        const remoteChecksum = files[file].checksum
        const localChecksum = md5(fs.readFileSync(filePath))

        debug(file)
        debug(localChecksum)
        debug(remoteChecksum)
        return localChecksum !== remoteChecksum
      })
    } else if (!this.existRemotely) {
      return true
    } else if (this.isDependencySocket || this.isProjectRegistryDependency) {
      if (this.remote.status !== 'ok') {
        return false
      }

      debug(`Spec version: ${this.spec.version}`)
      debug(`Remote version: ${this.getVersion()}`)
      if (this.spec.version === this.getVersion()) {
        return false
      }
    }
  }
}

Socket.listLocal = utils.listLocal

export default Socket
