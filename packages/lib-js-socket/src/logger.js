/**
 * Debug your code.
 * @property {Function}
 */

const LEVELS = ['error', 'warn', 'info', 'debug']

class Logger {
  constructor (instance, {scope, callback, levels, config}) {
    this._start = null
    this._scope = scope
    this._callback = callback
    this.config = instance.meta.debug

    levels.forEach(level => {
      this[level] = this._makePrinter.bind(this, level)
    })
  }

  _makePrinter (...args) {
    this._start = this._start || this._getNow()
    this._level = args.shift()

    const date = this._print(...args)

    if (this._callback) {
      this._callback({args, date, level: this._level})
    }

    this._level = null
  }

  _pad (width, string, padding) {
    return width <= string.length
      ? string
      : this._pad(width, padding + string, padding)
  }

  _print (...args) {
    // Time
    const now = this._getNow()
    const diff = `+${this._calculateDiff(this._start, now)}`
    const time = this._getNowString(now).split(' ')[1]

    // Level
    const level = this._pad(5, `${this._level}`, ' ')
    args = args.map(this._parseArg).join(' ')

    if (this.config !== false) {
      console.log(`${level}:`, time, this._scope, args, diff, 'ms')
    }

    return now
  }

  _parseArg (arg) {
    const isObject = arg !== null && typeof arg === 'object'

    if (isObject) {
      return `\n\n  ${JSON.stringify(arg, null, 2)
        .split('\n')
        .join('\n  ')}\n\n`
    }

    return arg
  }

  _getNow () {
    return new Date()
  }

  _getNowString (date) {
    return date
      .toISOString()
      .replace(/T/, ' ') // Replace T with a space
      .replace(/\..+/, '') // Delete the dot and everything after
  }

  _calculateDiff (t1, t2) {
    return (t2.getTime() - t1.getTime()) / 1000
  }
}

export default instance => {
  const logger = function (scope) {
    return new Logger(instance, {
      scope,
      callback: logger._callback,
      levels: logger._levels || LEVELS
    })
  }

  logger.levels = function (levels) {
    if (!Array.isArray(levels)) {
      throw new TypeError('Levels must be array of strings.')
    }

    logger._levels = levels
  }

  logger.listen = function (callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function.')
    }

    logger._callback = callback
  }

  return logger
}
