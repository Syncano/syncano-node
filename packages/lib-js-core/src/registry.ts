import * as logger from 'debug'
import * as FormData from 'form-data'
import * as fs from 'fs'
import * as https from 'https'
import QueryBuilder from './query-builder'

const debug = logger('core:registry')

/**
 * Connection with Syncano Registry.
 */
export default class Socket extends QueryBuilder {
  public async searchSocketsByAll (keyword: string) {
    debug(`searchSocketsByAll: ${keyword}`)
    const headers = {
      'X-Syncano-Account-Key': this.instance.accountKey
    }
    const options = {
      body: JSON.stringify({ keyword }),
      method: 'POST'
    }

    return this.nonInstanceFetch(this.url('registry/search'), options, headers)
  }

  public async searchSocketByName (name: string, version: string) {
    debug(`searchSocketByName: ${name} (${version})`)

    const headers = {
      'X-Syncano-Account-Key': this.instance.accountKey
    }
    const options = {
      body: JSON.stringify({
        name,
        version
      }),
      method: 'POST'
    }

    return this.nonInstanceFetch(this.url('registry/get'), options, headers)
  }

  public async publishSocket (socketName: string, version: string) {
    debug('publishSocket', socketName)
    const headers = {
      'X-Syncano-Account-Key': this.instance.accountKey
    }
    const options = {
      body: JSON.stringify({
        name: socketName,
        version
      }),
      method: 'POST'
    }
    return this.nonInstanceFetch(this.url('registry/publish'), options, headers)
  }

  public async getSocket (url: string, fileDescriptor: fs.WriteStream) {
    debug('getSocket', url)
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        response.pipe(fileDescriptor)
        fileDescriptor.on('finish', () => {
          debug('Socket zip downloaded')
          fileDescriptor.close()
          resolve()
        })
      })
    })
  }

  public async submitSocket (socketSpec: any, socketConfig: any, socketZipPath: string) {
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
      body: form,
      method: 'POST'
    }

    return this.nonInstanceFetch(this.url('registry/add'), options, headers)
  }

  private url (registryEndpoint: string) {
    return `${this.getSyncanoRegistryURL()}/${registryEndpoint}/`
  }
}
