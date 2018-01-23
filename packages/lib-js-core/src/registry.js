import fs from 'fs'
import https from 'https'
import FormData from 'form-data'
import logger from 'debug'
import QueryBuilder from './query-builder'

const debug = logger('core:registry')

/**
 * Connection with Syncano Registry.
 * @property {Function}
 * @example {@lang javascript}
 * const socketList = await registry.searchSocketsByAll('facebook')
 */
export default class Socket extends QueryBuilder {
  url (registryEndpoint) {
    return `${this._getSyncanoRegistryURL()}/${registryEndpoint}/`
  }

  async searchSocketsByAll (keyword) {
    debug(`searchSocketsByAll: ${keyword}`)
    const headers = {
      'X-Syncano-Account-Key': this.instance.accountKey
    }
    const options = {
      method: 'POST',
      body: JSON.stringify({ keyword })
    }

    return this.nonInstanceFetch(this.url('registry/search'), options, headers)
  }

  async searchSocketByName (name, version) {
    debug(`searchSocketByName: ${name} (${version})`)

    const headers = {
      'X-Syncano-Account-Key': this.instance.accountKey
    }
    const options = {
      method: 'POST',
      body: JSON.stringify({
        name,
        version
      })
    }

    return this.nonInstanceFetch(this.url('registry/get'), options, headers)
  }

  async publishSocket (socketName, version) {
    debug('publishSocket', socketName)
    const headers = {
      'X-Syncano-Account-Key': this.instance.accountKey
    }
    const options = {
      method: 'POST',
      body: JSON.stringify({
        name: socketName,
        version
      })
    }
    return this.nonInstanceFetch(this.url('registry/publish'), options, headers)
  }

  async getSocket (url, fileDescriptor) {
    debug('getSocket', url)
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        response.pipe(fileDescriptor)
        fileDescriptor.on('finish', () => {
          debug('Socket zip downloaded')
          fileDescriptor.close(resolve)
        })
      })
    })
  }

  async submitSocket (socketSpec, socketConfig, socketZipPath) {
    debug('submitSocket', socketZipPath)

    const form = new FormData()
    form.append('file', fs.createReadStream(socketZipPath))
    form.append('name', socketSpec.name)
    form.append('description', socketSpec.description)
    form.append('version', socketSpec.version)
    form.append('keywords', JSON.stringify(socketSpec.keywords || []))
    form.append('config', JSON.stringify(socketConfig))

    const headers = form.getHeaders()
    headers['X-Syncano-Account-Key'] = this.instance.accountKey

    const options = {
      method: 'POST',
      body: form
    }

    return this.nonInstanceFetch(this.url('registry/add'), options, headers)
  }
}
