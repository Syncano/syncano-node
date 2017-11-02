import QueryBuilder from './query-builder'

/**
 * Syncano account query builder
 * @property {Function}
 */
class Event extends QueryBuilder {
  url () {
    const {instanceName} = this.instance

    return `${this._getInstanceURL(instanceName)}/triggers/emit/`
  }

  /**
   * Emit event
   *
   * @returns {Promise}
   *
   * @example {@lang javascript}
   * const instance = await event.emit('signal_name', payload={})
   */
  emit (signalString, payload) {
    const fetch = this.fetch.bind(this)
    const {socket, signal} = Event._splitSignal(signalString)

    const signalParams = []

    if (socket) {
      signalParams.push(socket)
    } else {
      signalParams.push(this.instance.socket)
    }

    signalParams.push('.')
    signalParams.push(signal)

    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        body: JSON.stringify({
          signal: signalParams.join(''),
          payload
        })
      }

      fetch(this.url(), options)
        .then(resolve)
        .catch(reject)
    })
  }

  static _splitSignal (signalString) {
    const splited = signalString.split('.')
    if (splited.length === 1) {
      return {signal: splited[0]}
    }
    return {
      socket: splited[0],
      signal: splited[1]
    }
  }
}

export default Event
