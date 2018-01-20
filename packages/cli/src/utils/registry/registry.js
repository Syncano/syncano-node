import fs from 'fs'
import path from 'path'
import axios from 'axios'
import https from 'https'
import FormData from 'form-data'

import logger from '../debug'
import session from '../session'

const REGISTRY_TIMEOUT = 60000

const { debug } = logger('utils-registry')

class Registry {
  constructor () {
    debug('Registry.constructor')

    const registryInstance = process.env.SYNCANO_SOCKET_REGISTRY_INSTANCE || 'socket-registry'
    this.registryHost = `${registryInstance}.${session.ENDPOINT_HOST}`
    this.registryHostUrl = `https://${this.registryHost}`

    this.fileStorageHost = session.getHost()
    this.fileStorageEndpoint = `/v2/instances/${registryInstance}/classes/storage/objects/`

    if (session.project) {
      this.installEndpoint = `/v2/instances/${session.project.instance}/sockets/install/`
      this.installUrl = `https://${session.getHost()}${this.installEndpoint}`
    }
  }

  getFullSocket (name, version) {
    return this.searchSocketByName(name, version)
  }

  async searchSocketByName (name, version) {
    debug(`searchSocketByName: ${name} (${version})`)
    const response = await axios.request({
      url: `https://${this.registryHost}/registry/get/`,
      method: 'POST',
      timeout: REGISTRY_TIMEOUT,
      data: {
        name,
        version
      },
      headers: {
        'X-Syncano-Account-Key': session.settings.account.getAuthKey()
      }
    })
    return response.data
  }

  static getSocket (socket) {
    debug('getSocket')

    const fileName = path.join(session.getBuildPath(), `${socket.name}.zip`)
    const file = fs.createWriteStream(fileName)
    return new Promise((resolve, reject) => {
      https.get(socket.url, (response) => {
        response.pipe(file)
        file.on('finish', () => {
          debug('Socket zip downloaded')
          file.close(resolve)
        })
      })
    })
  }

  async publishSocket (socketName, version) {
    debug('publishSocket', socketName)
    const response = await axios.request({
      url: `${this.registryHostUrl}/registry/publish/`,
      method: 'POST',
      timeout: REGISTRY_TIMEOUT,
      data: {
        name: socketName,
        version
      },
      headers: {
        'X-Syncano-Account-Key': session.settings.account.getAuthKey()
      }
    })
    return response.data
  }

  async searchSocketsByAll (keyword) {
    const response = await axios.request({
      url: `${this.registryHostUrl}/registry/search/`,
      method: 'POST',
      timeout: REGISTRY_TIMEOUT,
      data: { keyword },
      headers: {
        'X-Syncano-Account-Key': session.settings.account.getAuthKey()
      }
    })
    return response.data
  }

  async submitSocket (socket) {
    await socket.createPackageZip()

    const form = new FormData()
    form.append('file', fs.createReadStream(socket.getSocketZip()))
    form.append('name', socket.spec.name)
    form.append('description', socket.spec.description)
    form.append('version', socket.spec.version)
    form.append('keywords', JSON.stringify(socket.spec.keywords || []))
    form.append('config', JSON.stringify(socket.getFullConfig()))

    return new Promise((resolve, reject) => {
      form.submit({
        method: 'POST',
        protocol: 'https:',
        host: session.getHost(),
        path: `${this.registryHostUrl}/registry/add/`,
        headers: {
          'X-Syncano-Account-Key': session.settings.account.getAuthKey()
        }
      }, (err, res) => {
        if (err) {
          debug('Error while uploading file', err)
          reject(err)
        }
        res.on('data', (data) => {
          debug('Upload done', data.toString())
          resolve(data)
        })
      })
    })
  }
}

export default Registry
