import QueryBuilder from './query-builder'

/**
 * Syncano account query builder
 * @property {Function}
 */
class Channel extends QueryBuilder {
  /**
   * Publish any payload to channel room
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

  private url () {
    const {instanceName} = this.instance

    return `${this.getInstanceURL(instanceName)}/channels/default/publish/`
  }
}

export default Channel
