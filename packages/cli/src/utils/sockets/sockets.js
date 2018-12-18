import fs from 'fs'
import klawSync from 'klaw-sync'
import glob from 'glob'
import child from 'child_process'
import FindKey from 'find-key'
import md5File from 'md5-file/promise'
import YAML from 'js-yaml'
import axios from 'axios'
import mkdirp from 'mkdirp'
import path from 'path'
import FormData from 'form-data'
import archiver from 'archiver'
import Promise from 'bluebird'
import template from 'es6-template-strings'
import _ from 'lodash'
import SourceMap from 'source-map'
import WebSocket from 'ws'
import yauzl from 'yauzl'
import Validator from '@syncano/validate'

import logger from '../debug'
import session from '../session'
import utils from './utils'
import Hosting from '../hosting'
import { p, echo } from '../print-tools'
import { getTemplate } from '../templates'
import { CompileError, SocketUpdateError, CompatibilityError } from '../errors'

const { debug, info } = logger('utils-sockets')

class MetadataObject {
  constructor (name, metadata, socketName) {
    this.name = name
    this.metadata = metadata
    this.socketName = socketName
    this.existRemotely = null
    this.existLocally = null
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
    this.fromNPM = null

    // that looks stupid
    this.remote = {
      spec: {
        endpoints: {},
        event_handlers: {},
        events: {}
      },
      metadata: {}
    }

    this.spec = {
      spec: {
        endpoints: {},
        event_handlers: {},
        events: {}
      }
    }

    this.loadLocal()
  }

  isDependency () {
    debug('isDependency')
    // TODO: better way to dermine that?
    if (this.socketPath.match(/node_modules/)) {
      return true
    }
  }

  static getTemplatesChoices () {
    return utils.getTemplatesChoices()
  }

  static uninstall (socket = {}) {
    debug('uninstall', socket.name)

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
    utils.deleteFolderRecursive(socket.localPath)
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

  // list all sockets (mix of locally definde and installed on server)
  static async list () {
    debug('list()')
    // Local Socket defined in folders and in project deps
    const localSocketsList = utils.listLocal()
    return Promise.all(localSocketsList.map((socketName) => Socket.get(socketName)))
  }

  // Creating Socket simple object
  static getLocal (socketName) {
    info('getLocal()', socketName)
    return new Socket(socketName)
  }

  static async get (socketName) {
    info('get()', socketName)
    const socket = Socket.getLocal(socketName)
    await socket.loadRemote()
    return socket
  }

  static create (socketName, templateName) {
    debug('create socket', socketName, templateName)
    const newSocketPath = path.join(session.projectPath, 'syncano', socketName)
    const socket = new Socket(socketName, newSocketPath)
    if (socket.existLocally) {
      return Promise.reject(new Error('Socket with given name already exist!'))
    }
    return socket.init(templateName)
  }

  async init (templateName) {
    debug('init', templateName)
    return new Promise((resolve, reject) => {
      const socketPath = this.socketPath
      if (!fs.existsSync(socketPath)) {
        mkdirp.sync(socketPath)
      }

      try {
        const templateFolder = path.normalize(getTemplate(templateName))
        const files = klawSync(templateFolder, {nodir: true})
        files.forEach(file => {
          const oldContent = fs.readFileSync(file.path, 'utf8')
          const socket = {
            socketName: this.name,
            socketDescription: `Description of ${this.name}`
          }

          const newContent = template(oldContent, socket, { partial: true })
          const fileToSave = path.join(socketPath, file.path.replace(templateFolder, ''))

          mkdirp.sync(path.parse(fileToSave).dir)
          fs.writeFileSync(path.join(socketPath, file.path.replace(templateFolder, '')), newContent)
        })
        resolve(this)
      } catch (err) {
        return reject(err)
      }
    })
  }

  verifySchema () {
    // Reload local settings
    if (this.settings.load) this.settings.load()
    return Validator.validateMainSchema(this.settings.attributes)
  }

  async verify () {
    if (!fs.existsSync(this.getSrcFolder())) {
      throw new Error('No src folder!')
    }
    this.verifySchema()
  }

  getFullConfig () {
    return this.settings.getFull()
  }

  async getRemote () {
    info('getRemote()', this.name)
    try {
      return await session.connection.socket.get(this.name)
    } catch (err) {
      return false
    }
  }

  async getRemoteSpec () {
    info('getRemoteSpec()')
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
    info('setRemoteState()')
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
    info('loadRemote()')
    const socket = await this.getRemote()
    if (socket) {
      await this.setRemoteState(socket)
      await this.getRemoteSpec()
    } else {
      this.existRemotely = false
    }
    return this
  }

  loadLocal () {
    debug('loadLocal()')
    if (this.settings.loaded) {
      this.existLocally = true
      this.localPath = this.settings.baseDir
      this.spec = this.settings.getFull()
      if (this.localPath.indexOf('node_modules') > -1) {
        this.fromNPM = true
      }
    }
  }

  isSocketFile (fileFullPath) {
    info('isSocketFile()', fileFullPath)
    return fileFullPath.includes(this.localPath)
  }

  getRawStatus () {
    return {
      existRemotely: this.existRemotely,
      existLocally: this.existLocally
    }
  }

  getStatus () {
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
    if (this.existLocally) {
      if (this.fromNPM) {
        return { msg: 'installed via NPM', type: 'ok' }
      }
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
    return path.join(this.socketPath, 'src', path.sep)
  }

  getCompiledScriptsFolder () {
    const folder = path.join(this.socketPath, '.dist', 'src', path.sep)
    if (!fs.existsSync(folder)) {
      mkdirp.sync(folder)
    }
    return folder
  }

  getSocketZipPath () {
    const folder = path.join(this.socketPath, '.zip')
    if (!fs.existsSync(folder)) {
      mkdirp.sync(folder)
    }
    return folder
  }

  getSocketZip () {
    info('getSocketZip()')
    return path.join(this.getSocketZipPath(), 'src.zip')
  }

  getSocketEnvZip () {
    info('getSocketEnvZip()')
    return path.join(this.getSocketZipPath(), 'env.zip')
  }

  async isEmptyEnv () {
    info('isEmptyEnv()')
    if (fs.existsSync(this.getSocketEnvZip())) {
      const envZipFiles = await this.listZipFiles(this.getSocketEnvZip())
      return !(envZipFiles.length > 0)
    }
    return true
  }

  async getSocketNodeModulesChecksum () {
    info('getSocketNodeModulesChecksum()')
    if (fs.existsSync(this.getSocketEnvZip())) {
      return md5File(this.getSocketEnvZip())
    }
    return 'none'
  }

  async getSocketSourcesZipChecksum () {
    debug('getSocketSourcesZipChecksum()')
    if (fs.existsSync(this.getSocketEnvZip())) {
      return md5File(this.getSocketZip())
    }
    return 'none'
  }

  getSocketConfigFile () {
    return path.join(session.projectPath, this.name, 'socket.yml')
  }

  composeFromSpec (objectType, ObjectClass) {
    info('composeFromSpec()', objectType)
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
    info('getEndpoints()')
    return this.composeFromSpec('endpoints', Endpoint)
  }

  getEndpoint (endpointName) {
    info('getEndpoints()')
    return _.find(this.getEndpoints(), { name: endpointName })
  }

  getEventHandlers () {
    info('getEventHandlers()')
    return this.composeFromSpec('event_handlers', Handler)
  }

  getEvents () {
    info('getEvents()')
    return this.composeFromSpec('events', Event)
  }

  getEndpointTrace (endpointName, traceId) {
    info('getEndpointTrace()', endpointName)
    return session.connection.trace.get(this.name, endpointName, traceId)
  }

  async getEndpointTraces (endpointName, lastId) {
    info('getEndpointTraces()', endpointName, lastId)
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
    info('getTraces()')
    const url = [
      `https://${session.getHost()}/v2/instances/${session.project.instance}/channels/eventlog/poll/`,
      '?transport=websocket',
      `&api_key=${session.settings.account.getAuthKey()}`,
      `&room=${`socket:${this.name}`}`
    ].join('')

    return new WebSocket(url)
  }

  static async getEndpointTraceByUrl (url) {
    const resp = await axios.request({
      url: `https://${session.getHost()}${url}`,
      method: 'GET',
      headers: {
        'X-Api-Key': session.settings.account.getAuthKey()
      }
    })
    return resp.data
  }

  async listZipFiles (zipPath) {
    info('listZipFiles()', zipPath)
    const files = []
    if (!fs.existsSync(zipPath)) {
      return files
    }

    return new Promise((resolve, reject) => {
      yauzl.open(zipPath, {lazyEntries: true}, (err, zipfile) => {
        if (err) {
          reject(err)
        }
        zipfile.readEntry()
        zipfile.on('end', entry => {
          resolve(files)
        })
        zipfile.on('entry', entry => {
          if (/\/$/.test(entry.fileName)) {
            // Directory file names end with '/'.
            // Note that entires for directories themselves are optional.
            // An entry's fileName implicitly requires its parent directories to exist.
            zipfile.readEntry()
          } else {
            // file entry
            files.push(entry.fileName)
            zipfile.readEntry()
          }
        })
      })
    })
  }

  getAllFiles () {
    // Ignore patterns from .syncanoignore file
    let ignore = []
    try {
      ignore = fs.readFileSync(`${this.getCompiledScriptsFolder()}/.syncanoignore`, 'utf8').split('\n')
    } catch (err) {}

    return glob.sync(`**`, {
      cwd: this.getCompiledScriptsFolder(),
      ignore,
      realpath: true,
      nodir: true
    }).map(file => {
      return {
        fullPath: file,
        internalPath: file.replace(`${this.getCompiledScriptsFolder()}`, '')
      }
    })
  }

  async createZip (params = {partial: true}) {
    info('createZip()')
    return new Promise(async (resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } })
      const output = fs.createWriteStream(this.getSocketZip(), { mode: 0o700 })

      archive.pipe(output)
      archive.on('error', reject)

      // Adding socket.yml if needed
      const localYMLChecksum = await md5File(this.getSocketYMLFile())
      const remoteYMLChecksum = this.remote.files && this.remote.files['socket.yml']
        ? this.remote.files['socket.yml'].checksum
        : ''

      const addMetaFiles = () => {
        info('Adding file to archive: \'socket.yml\'')
        archive.file(this.getSocketYMLFile(), { name: 'socket.yml' })
      }

      info('Processing: \'socket.yml\'')
      if (params.partial) {
        if (remoteYMLChecksum !== localYMLChecksum) {
          addMetaFiles()
        } else {
          info('Ignoring file: socket.yml')
        }
      } else {
        addMetaFiles()
      }

      const files = this.getAllFiles()

      // Adding all files (besides those filtered out)
      await Promise.all(files.map(async file => {
        // with "internal" path
        const fileNameWithPath = file.internalPath
        const remoteFile = this.remote.files ? this.remote.files[fileNameWithPath] : null

        if (remoteFile && params.partial) {
          if (remoteFile.checksum !== await md5File(file.fullPath)) {
            debug(`Adding file to archive: ${fileNameWithPath}`)
            archive.file(file.fullPath, { name: fileNameWithPath })
          } else {
            debug(`Not adding file to archive (same checksum): ${fileNameWithPath}`)
          }
        } else {
          archive.file(file.fullPath, { name: fileNameWithPath })
        }
      }))

      archive.finalize()

      output.on('close', () => {
        resolve()
      })
    })
  }

  async createEnvZip () {
    debug('createEnvZip')
    return new Promise(async (resolve, reject) => {
      const output = fs.createWriteStream(this.getSocketEnvZip(), { mode: 0o700 })
      const archive = archiver('zip', { zlib: { level: 9 } })

      const envFolder = path.join(this.socketPath, '.dist', 'node_modules')

      const envExist = await fs.existsSync(envFolder)
      if (!envExist) {
        mkdirp.sync(envFolder)
      }

      let filesInZip = 0

      archive.pipe(output)
      archive.on('error', reject)

      const files = glob.sync(`**`, {
        cwd: envFolder,
        dot: true,
        follow: true,
        nodir: true
      })

      files.forEach(file => {
        archive.file(path.join(envFolder, file), {name: path.join('node_modules', file)})
        filesInZip += 1
      })

      if (filesInZip) {
        archive.finalize()
      } else {
        fs.unlinkSync(this.getSocketEnvZip())
        resolve(false)
      }

      output.on('close', () => {
        resolve(true)
      })
    })
  }

  async updateEnvCall (method) {
    info('updateEnvCall()')
    if (await this.isEmptyEnv()) {
      return
    }

    return new Promise(async (resolve, reject) => {
      const form = new FormData()

      let endpointPath = `/v2/instances/${session.project.instance}/environments/`
      if (method === 'PATCH') {
        endpointPath = `/v2/instances/${session.project.instance}/environments/${this.name}/`
      }

      debug('endpointPath', endpointPath)
      form.append('name', this.name)
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

        if (err || res.statusCode === 404) {
          debug(`environment ${this.name} was not found`)
          return reject(err || res)
        }

        if (res.statusCode === 200) {
          resolve()
        }

        if (res.statusCode === 413) {
          debug('error while updating environment - environment is to big :(')
          return reject(new Error('environment is to big'))
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
    info('updateEnv()')
    const resp = await this.socketEnvShouldBeUpdated()
    if (resp) {
      if (!this.isDependency()) {
        await this.createEnvZip()
      }
      return this.updateEnvCall(resp)
    }
    return 'No need to update'
  }

  async updateSocketZip ({ config, install = false }) {
    info('updateSocketZip()')
    let endpointPath = `/v2/instances/${session.project.instance}/sockets/`
    // const zipChecksum = await md5File(this.getSocketZip())

    if (!install) {
      endpointPath += `${this.name}/`
    }

    const zipFiles = await this.listZipFiles(this.getSocketZip())
    const allFiles = await this.getAllFiles().map(file => file.internalPath)
    const numberOfFiles = zipFiles.length

    if (numberOfFiles === 0 && this.isConfigSynced(config)) {
      debug('config is synced and nothing to update')
      return {status: 'stopped'}
    }

    // if (this.remote.metadata.zip_checksum === zipChecksum) {
    //   debug('zip is the same, not updating')
    //   return {status: 'stopped'}
    // }

    debug('preparing update')

    return new Promise(async (resolve, reject) => {
      const form = new FormData()

      form.append('name', this.name)

      if (await this.isEmptyEnv()) {
        debug('environment is null')
        form.append('environment', '')
      } else {
        form.append('environment', this.name)
      }

      if (config) {
        form.append('config', JSON.stringify(config))
      }

      // const metadata = Object.assign({}, this.remote.metadata)
      // form.append('metadata', JSON.stringify(metadata))

      debug('zip_file_list', allFiles)
      form.append('zip_file_list', JSON.stringify(allFiles))

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
          responseData = JSON.parse(responseData)
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

  getSocketYMLFile () {
    return path.join(this.socketPath, 'socket.yml')
  }

  async createAllZips () {
    await this.compile({ updateSocketNPMDeps: true })
    await this.createEnvZip()
    await this.createZip({partial: false})
  }

  async compile (params = { updateSocketNPMDeps: false }) {
    info('compile()', this.name, this.socketPath)

    return new Promise(async (resolve, reject) => {
      const command = 'npm'
      let args = null

      if (params.updateSocketNPMDeps) {
        args = 'run build -s'
      } else {
        args = 'run build:src -s'
      }

      process.env.FORCE_COLOR = true
      info('start compilation')
      const out = child.spawn(
        command,
        args.split(' '),
        {
          cwd: this.socketPath,
          maxBuffer: 2048 * 4096,
          stdio: ['pipe', 'pipe', 'pipe']
        }
      )

      let stderr = ''
      out.stderr.on('data', (chunk) => {
        stderr += chunk
      })

      let stdout = ''
      out.stdout.on('data', (chunk) => {
        stdout += chunk
      })

      out.on('error', () => {
        reject(new CompileError(stderr))
      })

      out.on('close', (code) => {
        info('compilation done', 'exit code:', code)
        if (code !== 0) {
          reject(new CompileError(stderr || stdout))
        } else {
          resolve()
        }
      })
    })
  }

  isConfigSynced (config) {
    info('isConfigSynced()')
    return _.isEqual(config, this.remote.config)
  }

  updateConfig (config) {
    info('updateConfig()')
    debug('updateConfig()', config)
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
    info('update()', this.name)
    debug('update', params)
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
    if (!this.isDependency()) {
      await this.compile({ updateSocketNPMDeps: params.updateSocketNPMDeps })
      await this.createZip({partial: this.remote.status !== 'error'})
    }

    if (params.updateEnv) await this.updateEnv()

    const resp = await this.updateSocketZip({ config, install: !this.existRemotely })
    debug('resp after update Socket zip:', resp)

    if (resp && resp.status === 'stopped') {
      return { status: 'stopped' }
    }

    if (resp && resp.status !== 'ok') return this.waitForStatusInfo()
  }

  waitForStatusInfo () {
    info('waitForStatusInfo()')

    return new Promise((resolve, reject) => {
      const getStatus = async () => {
        const socket = await this.getRemote()
        if (socket.status === 'ok') {
          resolve({status: socket.status})
        }
        if (socket.status !== 'ok' && socket.status !== 'error') {
          setTimeout(getStatus, 400)
        } else {
          this.setRemoteState(socket)
          if (socket.status === 'ok') {
            resolve({status: socket.status})
          }
          let errorMsg
          if (socket.status_info && socket.status_info.error) {
            errorMsg = socket.status_info.error
          } else {
            errorMsg = socket.status_info
          }
          reject(new SocketUpdateError(errorMsg))
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
      this.socketPath,
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
          path.join(this.socketPath, '../', origFilePath),
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
    const socketVarName = this.name.replace('-', '_').toUpperCase()
    const optionVarName = optionName.replace('-', '_').toUpperCase()
    return process.env[`${socketVarName}__${optionVarName}`] ||
      process.env[`${socketVarName}_${optionVarName}`]
  }

  getConfigOptionsToAsk () {
    // If there is not options in spec it is always no options to ask
    if (this.spec && !this.spec.config) { return {} }

    const options = {}

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

  async socketEnvShouldBeUpdated () {
    info('socketEnvShouldBeUpdated()')
    try {
      const resp = await axios.request({
        url: `https://${session.getHost()}/v2/instances/${session.project.instance}/environments/${this.name}/`,
        method: 'GET',
        timeout: 50000,
        headers: {
          'X-Api-Key': session.settings.account.getAuthKey()
        }
      })

      const nodeModulesChecksum = await this.getSocketNodeModulesChecksum()
      debug('remote env checksum:', resp.data.checksum)
      debug('local env checksum:', nodeModulesChecksum)

      if (resp.data.checksum === nodeModulesChecksum) {
        debug(`env "${this.name}" is up to date`)
        return false
      }
      return 'PATCH'
    } catch (err) {
      return 'POST'
    }
  }

  isCompatible () {
    const socketMajorVersion = this.spec.version.split('.')[0]
    if (socketMajorVersion !== session.majorVersion) {
      throw new CompatibilityError(socketMajorVersion, session.majorVersion)
    }
    return true
  }
}

Socket.listLocal = utils.listLocal

export default Socket
