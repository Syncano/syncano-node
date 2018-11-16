import QueryBuilder from './query-builder'

/**
 * Syncano Backups
 *
 * @property {Function}
 */
class Backups extends QueryBuilder {
  url () {
    const {instanceName} = this.instance

    return `${this._getInstanceURL(instanceName)}/backups/full/`
  }

  /**
   * Backups list helper
   *
   * @param {string} url
   *
   * @return {Array}
   */
  async _getBackups (url) {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'GET',
    }
    const headers = {
      'x-api-key': this.instance.accountKey
    }
    const res = await fetch(url, options, headers)
    let backups = res.objects

    if(res.next) {
      backups = backups.concat(await this._getGroups(`${this.baseUrl}${res.next}`))
    }

    return backups
  }

  /**
   * Backups list
   *
   * @return {Promise}
   */
  async list () {
    return  this._getBackups(this.url())
  }

  /**
   * Create new backup
   *
   * @return {Promise}
   */
  async create () {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'POST',
    }
    const headers = {
      'x-api-key': this.instance.accountKey
    }

    return fetch(this.url(), options, headers)
  }

  /**
   * Delete backup
   *
   * @param {number} id - Backup id
   *
   * @return {Promise}
   */
  async delete (id) {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'DELETE',
    }
    const headers = {
      'x-api-key': this.instance.accountKey
    }

    return fetch(`${this.url()}${id}/`, options, headers)
  }

  /**
   * Delete all backups
   *
   * @return {Promise}
   */
  async deleteAll () {
    const backups = await this.list()
    backups.forEach(({id}) => this.delete(id))
  }

  /**
   * Get backup
   *
   * @param {number} id - Backup id
   *
   * @return {Promise}
   */
  async get (id) {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'GET',
    }
    const headers = {
      'x-api-key': this.instance.accountKey
    }

    return fetch(`${this.url()}${id}/`, options, headers)
  }

  /**
   * Get last backup
   *
   * @return {Promise}
   */
  async last () {
    const backups = await this.list()
    return backups.pop()
  }
}

export default Backups
