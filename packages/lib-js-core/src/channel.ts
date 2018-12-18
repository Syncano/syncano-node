import {QueryBuilder} from './query-builder'
import {ChannelResponse} from './types'

export class ChannelClass extends QueryBuilder {
  /**
   * Publish any payload to channel
   *
   * @param channelName A string value used as channel name. Channel types:
   *                    - Public channels: `messages`
   *                    - User private channel: `messages.${username}`
   *                    - Channel room: `messages.${room}`
   * @param payload Value published to channel
   */
  public publish<T> (channelName: string, payload: T): Promise<ChannelResponse<T>> {
    const fetch = this.fetch.bind(this)

    return fetch(this.url(), {
      body: JSON.stringify({room: channelName, payload}),
      method: 'POST'
    })
  }

  private url () {
    const {instanceName} = this.instance

    return `${this.getInstanceURL(instanceName)}/channels/default/publish/`
  }
}
