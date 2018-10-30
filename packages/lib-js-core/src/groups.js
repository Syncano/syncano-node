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

    try {
      const res = await fetch(url, options)
      const groups = res.objects

      if(res.next) {
        groups.concat(await this._getGroups(res.next))
      }

      return groups
    } catch(err) {
      throw err
    }
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
    try {
      return await this._getGroups(this.url())
    } catch (err) {
      throw err
    }
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

    try {
      const group = await this.get(label)

      if(!group) {
        return await fetch(this.url(), options)
      } else {
        throw new Error('Group already exist')
      }
    } catch (err) {
      throw err
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

    try {
      const group = await this.get(label)

      return await fetch(`${this.url()}${group.id}/`, options)
    } catch (err) {
      throw err
    }
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

    try {
      const res = await fetch(`${this._getInstanceURL(instanceName)}/users/${user}/groups/`, options)

      return res.objects.map(elem => elem.group)
    } catch (err) {
      throw err
    }
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

    try {
      const group = await this.get(label)

      return await fetch(`${this.url()}${group.id}/users/`, options)
    } catch (err) {
      throw err
    }
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

    try {
      const group = await this.get(label)

      return await fetch(`${this.url()}${group.id}/users/${user}/`, options)
    } catch (err) {
      throw err
    }
  }
}

export default Groups
