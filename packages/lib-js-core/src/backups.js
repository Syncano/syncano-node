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
   *  Backups list helper
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

    try {
      const res = await fetch(url, options, headers)
      let backups = res.objects

      if(res.next) {
        backups = backups.concat(await this._getGroups(`${this.baseUrl}${res.next}`))
      }

      return backups
    } catch(err) {
      throw err
    }
  }

  /**
   *  Backups list
   *
   * @return {Promise}
   */
  async list () {
    return  this._getBackups(this.url())
  }

  /**
   *  Create new backup
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
   *  Get backup
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
}

export default Backups
