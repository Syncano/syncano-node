import QueryBuilder from './query-builder'

export interface ChannelResponse<T> {
  id: number,
  room: string,
  created_at: string,
  action: string,
  author: {
    admin: number
  },
  metadata: {
    type: string
  },
  payload: T,
  links: {
    self: string
    [x: string]: string
  }
}

export class Channel extends QueryBuilder {
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

    return new Promise((resolve, reject) => {
      const options = {
        body: JSON.stringify({room: channelName, payload}),
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
