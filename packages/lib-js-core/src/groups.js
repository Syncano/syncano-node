import QueryBuilder from './query-builder'

/**
 * Syncano groups
 * @property {Function}
 */
class Groups extends QueryBuilder {
  url () {
    const {instanceName} = this.instance

    return `${this._getInstanceURL(instanceName)}/groups/`
  }

  /**
   *  Groups list helper
   *
   * @param {string} url
   *
   * @return {Array}
   */
  async _getGroups (url) {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'GET',
    }
    const res = await fetch(url, options)
    let groups = res.objects

    if (res.next) {
      groups = groups.concat(await this._getGroups(`${this.baseUrl}${res.next}`))
    }

    return groups
  }

  /**
   *  Get group with users list
   *
   * @param {string} label - group name
   *
   * @return {Promise}
   *
   * @example [@lang javascript]
   * const group = await get('admin')
   */
  async get (label) {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'GET',
    }

    const groups = await this.list()
    const group = groups.find(elem => elem.label === label)
    if(group) {
      const res = await fetch(`${this.url()}${group.id}/users/`, options)
      group.users = res.objects
    }

    return group
  }

  /**
   * Get groups list
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * const groupsList = await groups.list()
   */
  async list() {
    return this._getGroups(this.url())
  }

  /**
   * Create new group
   *
   * @param {string} label - group name
   *
   * @return {Promise}
   *
   * @example [@lang javascript]
   * const adminGroup = await groups.create('admin')
   */
  async create (label, description = '') {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'POST',
      body: JSON.stringify({label, description})
    }
    const group = await this.get(label)

    if(!group) {
      return fetch(this.url(), options)
    } else {
      throw new Error('Group already exist')
    }
  }

  /**
   * Delete group
   *
   * @param {string} label - group name
   *
   * @return {Promise}
   *
   * @example [@lang javascript]
   * groups.delete('admin')
   */
  async delete (label) {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'DELETE'
    }
    const group = await this.get(label)

    return fetch(`${this.url()}${group.id}/`, options)
  }

  /**
   * Get user groups list
   *
   * @param {number} user - user id
   *
   * @return {Promise}
   *
   * @example [@lang javascript]
   * const userGroups = await groups.user(1)
   */
  async user (user) {
    const {instanceName} = this.instance
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'GET'
    }
    const res = await fetch(`${this._getInstanceURL(instanceName)}/users/${user}/groups/`, options)

    return res.objects.map(elem => elem.group)
  }

  /**
   * Add user to group
   *
   * @param {string} label - group name
   * @param {number} user - user id
   *
   * @return {Promise}
   *
   * @example [@lang javascript]
   * groups.addUser('admin', 1)
   */
  async addUser (label, user) {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'POST',
      body: JSON.stringify({user})
    }
    const group = await this.get(label)

    return fetch(`${this.url()}${group.id}/users/`, options)
  }

  /**
   * Remove user from group
   *
   * @param {string} label - group name
   * @param {number} user - user id
   *
   * @return {Promise}
   *
   * @example [@lang javascript]
   * groups.removeUser('admin', 1)
   */
  async removeUser (label, user) {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'DELETE'
    }
    const group = await this.get(label)

    return fetch(`${this.url()}${group.id}/users/${user}/`, options)
  }
}

export default Groups
