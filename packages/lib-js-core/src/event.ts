import QueryBuilder from './query-builder'

/**
 * Syncano account query builder
 * @property {Function}
 */
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
   * Emit event
   *
   * @example {@lang javascript}
   * const instance = await event.emit('signal_name', payload={})
   */
  public emit (signalString: string, payload: any): Promise<any> {
    const fetch = this.fetch.bind(this)
    const {socket, signal} = Event.splitSignal(signalString)

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

    return `${this._getInstanceURL(instanceName)}/triggers/emit/`
  }
}

export default Event
