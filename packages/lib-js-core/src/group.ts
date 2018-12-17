import {NotFoundError} from './errors'
import QueryBuilder from './query-builder'
import {SyncanoResponse, UserGroup} from './types'

export type Primitive = undefined | null | boolean | string | number

/**
 * Syncano groups
 * @property {Function}
 */
class Group extends QueryBuilder {
  /**
   * Get groups list
   *
   * @example
   * const groupsList = await groups.list()
   */
  public async list(): Promise<UserGroup[]> {
    return this.getGroups(this.url())
  }

  /**
   *  Get group by label
   *
   * @example
   * const group = await groups.find(10)
   * const group = await groups.find('admin')
   */
  public async find(groupIdOrName: string | number): Promise<UserGroup | undefined> {
    try {
      return this.findOrFail(groupIdOrName)
    } catch (err) {
      return undefined
    }
  }

  /**
   *  Get group by label
   *
   * @example
   * const group = await groups.find(10)
   * const group = await groups.find('admin')
   */
  public async findOrFail(groupIdOrName: string | number): Promise<UserGroup> {
    const groups = await this.list()
    const paramName = typeof groupIdOrName === 'string' ? 'name' : 'id'
    let result

    if (typeof groupIdOrName === 'string') {
      result = groups.find((item) => item.name === groupIdOrName)
    }

    if (typeof groupIdOrName === 'number') {
      result = groups.find((item) => item.id === groupIdOrName)
    }

    if (!result) {
      throw new NotFoundError(`Group with ${paramName}: "${groupIdOrName}" was not found.`)
    }

    return result
  }

  /**
   *  Get group by label
   *
   * @example
   * const group = await groups.findMany([10, 11])
   * const group = await groups.findMany(['admin', 'manager'])
   */
  public async findMany(id: string[] | number[]): Promise<UserGroup[]> {
    const groups = await this.list()

    if ((id as any[]).every((item) => typeof item === 'string')) {
      return groups.filter(
        (item) => (id as string[]).includes(item.name)
      )
    }

    if ((id as any[]).every((item) => typeof item === 'number')) {
      return groups.filter(
        (item) => (id as number[]).includes(item.id)
      )
    }

    return []
  }

  /**
   * Create new group
   *
   * @example
   * const adminGroup = await groups.create({
   *   name: 'admin',
   *   label: 'Admin',
   *   description: 'Optional description'
   * })
   */
  public async create (group: {
    name: string
    label?: string
    description?: string
  }): Promise<UserGroup> {
    const fetch = this.fetch.bind(this)

    return fetch(this.url(), {
      method: 'POST',
      body: JSON.stringify(group)
    })
  }

  /**
   * update group
   *
   * @example
   * groups.update(2, {name: 'admin', label: 'Admin'})
   */
  public async update (id: number, data: {
    name?: string
    label?: string
    description?: string
  }): Promise<UserGroup> {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'PATCH',
      body: JSON.stringify(data)
    }

    return fetch(`${this.url()}${id}/`, options)
  }

  /**
   * Delete group
   *
   * @example
   * // Delete by id
   * groups.delete(2)
   * // Or delete by name
   * groups.delete('admin')
   */
  public async delete (groupIdOrName: number | string): Promise<undefined> {
    const fetch = this.fetch.bind(this)
    const options = {method: 'DELETE'}

    if (typeof groupIdOrName === 'string') {
      const group = await this.find(groupIdOrName)

      if (!group) {
        throw new NotFoundError(`Group with name: "${groupIdOrName}" was not found.`)
      }

      await fetch(`${this.url()}${group.id}/`, options)

      return
    }

    await fetch(`${this.url()}${groupIdOrName}/`, options)

    return
  }

  /**
   * Check if user belongs to a group
   *
   * @example
   * const isUserInGroup = await groups.isUserAttachedTo('admin', 10)
   */
  public async isUserAttachedTo(groupIdOrName: number | string, userId: number) {
    const groups = await this.getUserGroups(userId)
    const paramName = typeof groupIdOrName === 'string' ? 'name' : 'id'

    return groups.some(((item) => item[paramName] === groupIdOrName))
  }

  /**
   * Get list user groups
   *
   * @example
   * const userGroups = await groups.getUserGroups(1)
   */
  public async getUserGroups(userId: number) {
    const url = `${this.getInstanceURL(this.instance.instanceName)}/users/${userId}/groups/`
    const {objects}: SyncanoResponse<UserGroup> = await this.fetch.bind(this)(url)

    return objects
  }

  /**
   * Add user to group
   *
   * @example
   * // Attach by group id
   * groups.attachUser(1, 2)
   * // Attach by group name
   * groups.attachUser('admin', 1)
   */
  public async attachUser (groupIdOrName: number | string, userId: number) {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'POST',
      body: JSON.stringify({user: userId})
    }

    if (typeof groupIdOrName === 'string') {
      const group = await this.findOrFail(groupIdOrName)

      return fetch(`${this.url()}${group.id}/users/`, options)
    }

    return fetch(`${this.url()}${groupIdOrName}/users/`, options)
  }

  /**
   * Remove user from group
   *
   * @example
   * // Detach user by group id
   * groups.detachUser(2, 1)
   * // Detach user by group name
   * groups.detachUser('admin', 1)
   */
  public async detachUser (groupIdOrName: number | string, userId: number) {
    const fetch = this.fetch.bind(this)
    const options = {
      method: 'DELETE'
    }

    if (typeof groupIdOrName === 'string') {
      const group = await this.findOrFail(groupIdOrName)

      return fetch(`${this.url()}${group.id}/users/${userId}/`, options)
    }

    return fetch(`${this.url()}${groupIdOrName}/users/${userId}/`, options)
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

export default Group
