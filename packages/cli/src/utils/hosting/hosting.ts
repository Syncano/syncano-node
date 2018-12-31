import fs from 'fs'
import FormData from 'form-data'
import format from 'chalk'
import path from 'path'
import prettyBytes from 'pretty-bytes'
import _ from 'lodash'
import md5 from 'md5'
import axios from 'axios'

import session from '../session'
import logger from '../debug'
import { getFiles } from './utils'
import { echo, error } from '../print-tools'

const { debug } = logger('utils-hosting')

class HostingFile {
  id: string
  instanceName: string
  path: string
  checksum: string | number[]
  size: number
  localPath: string
  isSynced: boolean
  isUpToDate: boolean

  loadRemote (fileRemoteData: any) {
    debug('loadRemote')
    this.id = fileRemoteData.id
    this.instanceName = fileRemoteData.instanceName
    this.path = decodeURIComponent(fileRemoteData.path)
    this.checksum = fileRemoteData.checksum
    this.size = fileRemoteData.size
    return this
  }
  loadLocal (fileLocalData: any) {
    debug('loadLocal')
    this.localPath = fileLocalData.localPath
    this.path = fileLocalData.path
    this.checksum = md5(fs.readFileSync(this.localPath))
    this.size = fs.statSync(this.localPath).size
    return this
  }
}

class Hosting {
  name: string
  path: string
  existRemotely: boolean | null
  existLocally: boolean | null
  hostingURL: string
  editHostingURL: string
  hostingHost: string
  config: any
  remote: any
  src: string
  cname: string
  browser_router: string
  domains: string[]
  auth: any
  url: string
  error: string
  isUpToDate: boolean

  constructor (hostingName: string) {
    debug('Hosting.constructor', hostingName)

    this.name = hostingName
    this.path = null

    this.existRemotely = null
    this.existLocally = null

    this.hostingURL = `/v2/instances/${session.project.instance}/hosting/`
    this.editHostingURL = `https://${session.getHost()}${this.hostingURL}${this.name}/`
    this.hostingHost = session.getHost() === 'api.syncano.rocks' ? 'syncano.ninja' : 'syncano.site'
    this.config = {}

    // Remote state
    this.remote = {
      domains: []
    }

    this.loadLocal()
  }

  static async add (params) {
    const configParams = {
      src: params.src,
      config: {
        browser_router: params.browser_router || false
      }
    }
    session.settings.project.addHosting(params.name, configParams)

    const hostingURL = `/v2/instances/${session.project.instance}/hosting/`
    const addHostingURL = `https://${session.getHost()}${hostingURL}`

    const domains = [params.name]
    if (params.cname) {
      domains.push(params.cname)
    }

    const paramsToAdd = {
      name: params.name,
      config: {
        browser_router: params.browser_router
      },
      domains
    }

    const response = await axios.request({
      url: addHostingURL,
      method: 'POST',
      data: paramsToAdd,
      headers: {
        'X-Api-Key': session.settings.account.getAuthKey()
      }
    })
    return response.data
  }

  hasCNAME (cname: string) {
    return this.remote.domains.indexOf(cname) > -1
  }

  updateHosting () {
    const params = {
      src: this.src,
      cname: this.cname,
      config: {
        browser_router: this.browser_router || false
      }
    }
    if (!this.cname) {
      delete params.cname
    }
    session.settings.project.updateHosting(this.name, params)
  }

  async configure (params) {
    const domains = this.remote.domains
    if (params.cname && domains.indexOf(params.cname) < 0) {
      domains.push(params.cname)
    }

    if (params.removeCNAME) {
      this.cname = null
      const cnameToRemoveIndex = domains.indexOf(params.removeCNAME)
      if (cnameToRemoveIndex > -1) {
        domains.splice(cnameToRemoveIndex, 1)
      }
    }

    this.cname = params.cname
    this.domains = domains
    this.config.browser_router = params.browser_router
    this.updateHosting()

    const paramsToUpdate = {
      name: this.name,
      config: this.config,
      domains
    }

    const response = await axios.request({
      url: this.editHostingURL,
      method: 'PATCH',
      data: paramsToUpdate,
      headers: {
        'X-Api-Key': session.settings.account.getAuthKey()
      }
    })
    return this.setRemoteState(response.data)
  }

  async deploy () {
    debug('deploy')

    if (!this.existRemotely) {
      debug('adding hosting')
      return Hosting.add({
        name: this.name,
        src: this.src
      })
    }

    debug('patching hosting')
    // TODO: not optimal
    const paramsToUpdate = {
      name: this.name,
      domains: this.domains,
      config: this.config,
      auth: this.auth || {}
    }

    const response = await axios.request({
      url: this.editHostingURL,
      method: 'PATCH',
      data: paramsToUpdate,
      headers: {
        'X-Api-Key': session.settings.account.getAuthKey()
      }
    })

    return this.setRemoteState(response.data)
  }

  async delete () {
    await axios.request({
      url: this.editHostingURL,
      method: 'DELETE',
      headers: {
        'X-Api-Key': session.settings.account.getAuthKey()
      }
    })
    session.settings.project.deleteHosting(this.name)
    return this
  }

  static get (hostingName) {
    debug(`get ${hostingName}`)
    const hosting = new Hosting(hostingName)
    return hosting.loadRemote()
  }

  static listFromProject () {
    return session.settings.project.listHosting()
  }

  // list all hostings (mix of locally definde and installed on server)
  static async list () {
    debug('list()')
    const projectHostings = Hosting.listFromProject()
    debug('projectHostings', projectHostings)
    return Promise.all(projectHostings.map((hosting) => Hosting.get(hosting.name)))
  }

  static getDirectories () {
    const excluded = ['node_modules', 'src', 'syncano']

    function notExcluded (dirname) {
      if (dirname.startsWith('.')) {
        return
      }
      if (excluded.indexOf(dirname) !== -1) {
        return
      }
      return dirname
    }

    return fs.readdirSync(process.cwd()).filter((file) => {
      const dirs = []
      if (fs.statSync(`${process.cwd()}/${file}`).isDirectory()) {
        dirs.push(file)
      }
      return dirs.find(notExcluded)
    })
  }

  async setRemoteState (hosting) {
    debug('setRemoteState', hosting.name)
    if (hosting && typeof hosting === 'object') {
      this.existRemotely = true
      this.remote.name = hosting.name
      this.remote.description = hosting.description
      this.remote.domains = hosting.domains
      this.remote.config = hosting.config || {}
      this.remote.config.browser_router = hosting.config.browser_router || false
      this.remote.auth = hosting.auth
      this.isUpToDate = await this.areFilesUpToDate()
    } else {
      this.existRemotely = false
      this.error = hosting
    }
    return Promise.resolve()
  }

  async loadRemote () {
    debug('loadRemote()')
    try {
      const hosting = await this.getRemote()
      await this.setRemoteState(hosting)
    } catch (err) {
      this.existRemotely = false
    }
    return this
  }

  loadLocal () {
    debug('loadLocal()')
    const localHostingSettings = session.settings.project.getHosting(this.name)

    if (localHostingSettings) {
      if (Object.keys(localHostingSettings).length > 0) {
        this.existLocally = true
        this.src = localHostingSettings.src
        this.cname = localHostingSettings.cname
        this.auth = localHostingSettings.auth
        this.path = path.join(session.projectPath, this.src, path.sep)
        this.url = this.getURL()

        this.config = localHostingSettings.config || {}
      }
    }
  }

  getURL () {
    return `https://${this.name}--${session.project.instance}.${session.location}.${this.hostingHost}`
  }

  encodePath (pathToEncode) {
    return pathToEncode.split(path.sep).map(part => encodeURI(part)).join(path.sep)
  }

  decodePath (pathToEncode) {
    return pathToEncode.split('/').map(part => decodeURI(part)).join('/')
  }

  // Verify local file if it should be created or updated
  async getFilesToUpload (file, remoteFiles) {
    debug('getFilesToUpload')
    const fileToUpdate = _.find(remoteFiles, { path: file.path }) as any
    const payload = new FormData()
    payload.append('file', fs.createReadStream(file.localPath))
    payload.append('path', this.encodePath(file.path))

    let singleFile = null

    if (fileToUpdate) {
      const remoteChecksum = fileToUpdate.checksum
      const localChecksum = file.checksum

      // Check if checksum of the local file is the same as remote one
      if (remoteChecksum === localChecksum) {
        try {
          echo(6)(`${format.green('✓')} File skipped: ${format.dim(file.path)}`)
        } catch (err) {
          error(err)
        }
      } else {
        try {
          singleFile = await session.connection.hosting.updateFile(this.name, fileToUpdate.id, payload)
          echo(6)(`${format.green('✓')} File updated: ${format.dim(file.path)}`)
        } catch (err) {
          echo(`Error while syncing (updating) ${file.path}`)
          debug(err.response.data)
        }
      }
    } else {
      // Adding (first upload) file
      try {
        singleFile = await session.connection.hosting.uploadFile(this.name, payload)
        echo(6)(`${format.green('✓')} File added:   ${format.dim(file.path)}`)
      } catch (err) {
        echo(`Error while syncing (creating) ${file.path}`)
        debug(err.response.data)
      }
    }

    return singleFile
  }

  // Verify remote file if it deleted
  getFilesToDelete (remoteFiles, localFiles) {
    debug('getFilesToDelete')

    const filesToDelete = remoteFiles.filter(file => !_.find(localFiles, {path: file.path}))

    return filesToDelete.map(async file => {
      const singleFile = await session.connection.hosting.deleteFile(this.name, file.id)
      echo(6)(`${format.green('✓')} File deleted: ${format.dim(file.path)}`)
      return singleFile
    })
  }

  // Files upload report
  generateUploadFilesResult (result) {
    if (!result) {
      return `\n\t${format.red('No files synchronized!')}\n`
    }
    const prettyUploadSize = prettyBytes(result.uploadedSize)

    return `\n\t${format.cyan(result.uploadedFilesCount)} files synchronized, ${format.cyan(prettyUploadSize)} in total
    \t${format.green(this.name)} is available at: ${format.green(this.getURL())}\n`
  }

  async uploadFiles (files, params) {
    let uploadedFilesCount = 0
    let uploadedSize = 0
    let promises = []

    const localFiles = await this.listLocalFiles()

    // promises for add/update operations
    await localFiles.forEach(file => {
      promises.push(this.getFilesToUpload(file, files))
    })

    const values = await Promise.all(promises)
    uploadedFilesCount = 0
    uploadedSize = 0
    values.forEach(upload => {
      uploadedFilesCount += 1
      uploadedSize += upload ? upload.size : 0
    })

    if (params.delete) {
      // promises for deleting files
      await Promise.all(this.getFilesToDelete(files, localFiles))
    }

    return { uploadedFilesCount, uploadedSize }
  }

  // Run this to synchronize hosted files
  // first we are getting remote files
  async syncFiles (params) {
    debug('syncFiles()')

    if (!fs.existsSync(this.path)) {
      throw new Error(`Local folder ${format.bold(this.path)} doesn't exist!`)
    }

    const remoteFiles = await this.listRemoteFiles()
    const result = await this.uploadFiles(remoteFiles, params)
    return this.generateUploadFilesResult(result)
  }

  async areFilesUpToDate () {
    debug('areFilesUpToDate()')

    // Check if local folder exist
    if (!fs.existsSync(this.path)) {
      return false
    }

    const localFiles = await this.listLocalFiles()
    const localChecksums = localFiles.map((localFile: any) => ({
      filePath: localFile.path,
      checksum: localFile.checksum
    }))

    const remoteFiles = await this.listRemoteFiles()
    const remoteChecksums = remoteFiles.map((remoteFile: any) => ({
      filePath: remoteFile.path,
      checksum: remoteFile.checksum
    }))

    return _.isEqual(_.sortBy(localChecksums, 'filePath'), _.sortBy(remoteChecksums, 'filePath'))
  }

  // Get list of the hostings first, then get the files list for given one
  async listRemoteFiles () {
    debug('listRemoteFiles()')
    const files = await session.connection.hosting.listFiles(this.name)
    return Promise.all(files.map(async file => {
      // TODO: Maybe it should be somehow done in the library not here
      file.path = this.decodePath(file.path)

      const hostingFile = new HostingFile()
      return hostingFile.loadRemote(file)
    }))
  }

  // Get info about hostings first, then get the files list for given one
  async listLocalFiles () {
    debug('listLocalFiles')
    const localHostingFiles = this.path ? await getFiles(this.path) : []
    if (!Array.isArray(localHostingFiles)) return localHostingFiles

    return localHostingFiles ? localHostingFiles.map(file => {
      return new HostingFile().loadLocal({
        localPath: file.fullPath,
        path: file.internalPath
      })
    }) : []
  }

  async listFiles () {
    debug('listFiles()')
    const remoteFiles = await this.listRemoteFiles()
    const listLocalFiles = await this.listLocalFiles()

    const files = []
    listLocalFiles.forEach(file => {
      const remoteCopy = _.find(remoteFiles, { path: file.path }) as any

      if (remoteCopy) {
        file.isUpToDate = file.checksum === remoteCopy.checksum
        file.isSynced = true
        _.extend(file, remoteCopy)
      }
      files.push(file)
    })
    return files
  }

  getCNAME () {
    return _.find(this.remote.domains, (domain) => domain.indexOf('.') !== -1)
  }

  getCnameURL () {
    const cname = this.getCNAME()
    if (cname) {
      return `http://${cname}`
    }
  }

  getRemote () {
    debug('getRemote()', this)
    return session.connection.hosting.get(this.name)
  }
}

export { Hosting as default, HostingFile }
