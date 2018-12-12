import QueryBuilder from './query-builder'
import { User, UserGroup } from './types'

interface UserGroupWithUsers extends UserGroup {
  users: User[]
}

/**
 * Syncano groups
 * @property {Function}
 */
class Groups extends QueryBuilder {
  /**
   * Get groups list
   *
   * @example {@lang javascript}
   * const groupsList = await groups.list()
   */
  public async list(): Promise<UserGroup[]> {
    return this.getGroups(this.url())
  }

  /**
   *  Get group by label
   *
   * @example [@lang javascript]
   * const group = await getByLabel('admin')
   */
  public async getByLabel(label: string): Promise<UserGroupWithUsers | undefined> {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'GET'
    }
    const groups = await this.list()
    const group: any = groups.find((item) => item.label === label)

    if (group) {
      // FIXME: Fetch all users
      const res = await fetch(`${this.url()}${group.id}/users/`, options)

      group.users = res.objects
    }

    return undefined
  }

  /**
   * Create new group
   *
   * @example [@lang javascript]
   * const adminGroup = await groups.create('admin', 'Optional description')
   */
  public async create (label: string, description = ''): Promise<UserGroup> {
    const fetch = this.fetch.bind(this)

    return fetch(this.url(), {
      method: 'POST',
      body: JSON.stringify({label, description})
    })
  }

  /**
   * Delete group
   *
   * @example [@lang javascript]
   * groups.delete(2)
   */
  public async delete (id: number) {
    const fetch = this.fetch.bind(this)

    return fetch(`${this.url()}${id}/`, {
      method: 'DELETE'
    })
  }

  /**
   * Get user groups list
   *
   * @deprecated Use `getByUserId(1)`
   *
   * @example [@lang javascript]
   * const userGroups = await groups.getByUserId(1)
   */
  public async user (userId: number) {
    return this.getByUserId(userId)
  }

  /**
   * Get user groups list
   *
   * @example [@lang javascript]
   * const userGroups = await groups.getByUserId(1)
   */
  public async getByUserId(userId: number) {
    const {instanceName} = this.instance
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'GET'
    }
    const res = await fetch(`${this.getInstanceURL(instanceName)}/users/${userId}/groups/`, options)

    return res.objects.map((item) => item.group)
  }

  /**
   * Add user to group
   *
   * @example [@lang javascript]
   * groups.addUser('admin', 1)
   */
  public async addUser (label: string, userId: number) {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'POST',
      body: JSON.stringify({userId})
    }
    const group = await this.get(label)

    return fetch(`${this.url()}${group.id}/users/`, options)
  }

  /**
   * Remove user from group
   *
   * @example [@lang javascript]
   * groups.removeUser(2, 1)
   */
  public async removeUser (groupId: number, userId: number) {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'DELETE'
    }
    const group = await this.get(label)

    return fetch(`${this.url()}${group.id}/users/${userId}/`, options)
  }

  /**
   *  Get group with users list
   *
   * @deprecated Use `getByLabel`
   *
   * @example [@lang javascript]
   * const group = await get('admin')
   */
  public async get (label: string): Promise<UserGroupWithUsers | undefined> {
    return this.getByLabel(label)
  }

  private async getGroups (url: string) {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'GET'
    }
    const res = await fetch(url, options)
    let groups = res.objects

    if (res.next) {
      groups = groups.concat(await this.getGroups(`${this.baseUrl}${res.next}`))
    }

    return groups
  }

  private url () {
    const {instanceName} = this.instance

    return `${this.getInstanceURL(instanceName)}/groups/`
  }
}

export default Groups
