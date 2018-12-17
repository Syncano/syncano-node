import { NotFoundError } from './errors'
import QueryBuilder from './query-builder'
import { BackupObject } from './types'

/**
 * Syncano Backups
 *
 * @property {Function}
 */
class Backup extends QueryBuilder {
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
          fetch(`${this.url()}${item}/`, options, headers).then(() => true).catch(() => false)
        )
      )
    }

    await fetch(`${this.url()}${id}/`, options, headers)

    return undefined
  }

  /**
   * Get backup
   *
   * @deprecated User `find`
   */
  public async get (id: number): Promise<BackupObject | undefined> {
    return this.find(id)
  }

  /**
   *  Get backup by id
   *
   * @example
   * const item = await backup.find(10)
   */
  public async find(id: number): Promise<BackupObject | undefined> {
    try {
      return this.findOrFail(id)
    } catch (err) {
      return undefined
    }
  }

  /**
   *  Get backup by id or throw error
   *
   * @example
   * const item = await backup.findOrFail(10)
   */
  public async findOrFail(id: number): Promise<BackupObject> {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'GET'
    }
    const headers = {
      'X-API-KEY': this.instance.accountKey
    }

    try {
      return fetch(`${this.url()}${id}/`, options, headers)
    } catch (err) {
      throw new NotFoundError(`Backup with id: "${id}" was not found.`)
    }
  }

  /**
   *  Get list of backups by id
   *
   * @example
   * const items = await backup.findMany([10, 11])
   */
  public async findMany(ids: number[]): Promise<BackupObject[]> {
    const groups = await this.list()

    return groups.filter((item) => ids.includes(item.id))
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

export default Backup
