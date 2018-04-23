import QueryBuilder from './query-builder'

class Event extends QueryBuilder {
  public static splitSignal (signalString: string) {
    const splited = signalString.split('.')
    if (splited.length === 1) {
      return {signal: splited[0]}
    }
    return {
      signal: splited[1],
      socket: splited[0]
    }
  }

  /**
   * Emit global events, to which other sockets can subscribe.
   *
   * @param eventName Name of emitted event. Sockets published to Syncano Registry should follow this naming convention
   *                  `socket-name.event-name`. Custom sockets should follow `event-name` naming.
   * @param payload Additional data passed along with event
   */
  public emit (eventName: string, payload: any): Promise<void> {
    const fetch = this.fetch.bind(this)
    const {socket, signal} = Event.splitSignal(eventName)

    const signalParams: string[] = []

    if (socket) {
      signalParams.push(socket)
    } else {
      signalParams.push(this.instance.socket)
    }

    signalParams.push('.')
    signalParams.push(signal)

    return new Promise((resolve, reject) => {
      const options = {
        body: JSON.stringify({
          payload,
          signal: signalParams.join('')
        }),
        method: 'POST'
      }

      fetch(this.url(), options)
        .then(resolve)
        .catch(reject)
    })
  }

  private url () {
    const {instanceName} = this.instance

    return `${this.getInstanceURL(instanceName)}/triggers/emit/`
  }
}

export default Event
