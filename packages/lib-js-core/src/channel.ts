import QueryBuilder from './query-builder'

/**
 * Syncano account query builder
 * @property {Function}
 */
class Channel extends QueryBuilder {
  public url () {
    const {instanceName} = this.instance

    return `${this._getInstanceURL(instanceName)}/channels/default/publish/`
  }

  /**
   * Publish to channel
   *
   * @example {@lang javascript}
   * const instance = await channel.publish('room_name', payload={})
   */
  public publish (room: string, payload: any): Promise<any> {
    const fetch = this.fetch.bind(this)

    return new Promise((resolve, reject) => {
      const options = {
        body: JSON.stringify({room, payload}),
        method: 'POST'
      }
      fetch(this.url(), options)
        .then(resolve)
        .catch(reject)
    })
  }
}

export default Channel
