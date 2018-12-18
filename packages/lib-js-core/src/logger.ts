/**
 * Debug your code.
 * @property {Function}
 */

const LEVELS = ['error', 'warn', 'info', 'debug']

class LoggerClass {
  public warn: (...args: any[]) => void
  public info: (...args: any[]) => void
  public error: (...args: any[]) => void
  public debug: (...args: any[]) => void
  private callback?: ((event: any) => void)
  private level: string | null = null
  private config: any
  private scope?: string
  private start: Date

  constructor (instance: any, {scope, callback, levels}: {
    scope: string
    callback?: (event: any) => void
    levels: string[]
  }) {
    this.start = this.getNow()
    this.scope = scope
    this.callback = callback
    this.config = instance.meta.debug

    this.warn = this.makePrinter.bind(this, 'warn')
    this.info = this.makePrinter.bind(this, 'info')
    this.error = this.makePrinter.bind(this, 'error')
    this.debug = this.makePrinter.bind(this, 'debug')

    levels.forEach((level) => {
      this[level] = this.makePrinter.bind(this, level)
    })
  }

  private makePrinter (...args: any[]) {
    this.level = args.shift()

    const date = this.print(...args)

    if (this.callback) {
      this.callback({args, date, level: this.level})
    }

    this.level = null
  }

  private pad (width: number, str: string, padding: string): string {
    return width <= str.length
      ? str
      : this.pad(width, padding + str, padding)
  }

  private print (...args: any[]) {
    // Time
    const now = this.getNow()
    const diff = `+${this.calculateDiff(this.start, now)}`
    const time = this.getNowString(now).split(' ')[1]

    // Level
    const level = this.pad(5, `${this.level}`, ' ')
    const str = args.map(this.parseArg).join(' ')

    if (this.config !== false) {
      if (process.env.NODE_ENV !== 'test') {
        console.log(`${level}:`, time, this.scope, str, diff, 'ms')
      }
    }

    return now
  }

  private parseArg (arg: any) {
    const isObject = arg !== null && typeof arg === 'object'

    if (isObject) {
      return `\n\n  ${JSON.stringify(arg, null, 2)
        .split('\n')
        .join('\n  ')}\n\n`
    }

    return arg
  }

  private getNow () {
    return new Date()
  }

  private getNowString (date: Date) {
    return date
      .toISOString()
      .replace(/T/, ' ') // Replace T with a space
      .replace(/\..+/, '') // Delete the dot and everything after
  }

  private calculateDiff (t1: Date, t2: Date) {
    return (t2.getTime() - t1.getTime()) / 1000
  }
}

export type LoggerType = (scope: string) => LoggerClass
export interface Logger extends LoggerType {
  callback?: (event: any) => void
  levels?: string[]
  setLevels: (userLevels: string[]) => void
  listen: (userCallback: ((event: any) => void)) => void
}

export default (instance: any) => {
  // tslint:disable-next-line:only-arrow-functions
  const logger: Logger = function (scope: string) {
    return new LoggerClass(instance, {
      callback: logger.callback,
      levels: LEVELS.concat(logger.levels || []),
      scope
    })
  }

  logger.setLevels = (userLevels: string[]) => {
    if (!Array.isArray(userLevels)) {
      throw new TypeError('Levels must be array of strings.')
    }

    logger.levels = userLevels
  }

  logger.listen = (userCallback: (event: any) => void) => {
    if (typeof userCallback !== 'function') {
      throw new TypeError('Callback must be a function.')
    }

    logger.callback = userCallback
  }

  return logger
}
