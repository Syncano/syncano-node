import QueryBuilder from './query-builder'
import { BackupObject } from './types'

/**
 * Syncano Backups
 *
 * @property {Function}
 */
class Backups extends QueryBuilder {
  /**
   * Backups list
   */
  public async list (): Promise<BackupObject[]> {
    return this.getBackups(this.url())
  }

  /**
   * Create new backup
   */
  public async create (): Promise<BackupObject> {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'POST'
    }
    const headers = {
      'X-API-KEY': this.instance.accountKey
    }

    return fetch(this.url(), options, headers)
  }

  /**
   * Delete backup
   */
  public async delete (id?: number | number[]): Promise<any> {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'DELETE'
    }
    const headers = {
      'X-API-KEY': this.instance.accountKey
    }

    if (id === undefined) {
      const items = await this.list()
      const ids = items.map((item: BackupObject) => item.id)

      return this.delete(ids)
    }

    if (Array.isArray(id)) {
      return Promise.all(
        id.map((item) =>
          fetch(`${this.url()}${item}/`, options, headers)
        )
      )
    }

    return fetch(`${this.url()}${id}/`, options, headers)
  }

  /**
   * Delete all backups
   *
   * @deprecated Use `delete` method without arguments
   */
  public async deleteAll () {
    return this.delete()
  }

  /**
   * Get backup
   */
  public async get (id: number): Promise<BackupObject> {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'GET'
    }
    const headers = {
      'X-API-KEY': this.instance.accountKey
    }

    return fetch(`${this.url()}${id}/`, options, headers)
  }

  /**
   * Get last backup
   */
  public async last () {
    const backups = await this.list()

    return backups.pop()
  }

  protected url () {
    const {instanceName} = this.instance

    return `${this.getInstanceURL(instanceName)}/backups/full/`
  }

  /**
   * Backups list helper
   */
  protected async getBackups (url: string) {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'GET'
    }
    const headers = {
      'X-API-KEY': this.instance.accountKey
    }
    const res = await fetch(url, options, headers)
    let backups = res.objects

    if (res.next) {
      const nextBackups = await this.getBackups(`${this.baseUrl}${res.next}`)

      backups = backups.concat(nextBackups.objects)
    }

    return backups
  }
}

export default Backups
