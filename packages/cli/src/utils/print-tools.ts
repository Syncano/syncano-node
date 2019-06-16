import format, { Chalk } from 'chalk'
import _ from 'lodash'
import util from 'util'

const MAP: Record<string, Chalk> = {
  '0': format.cyan.dim, // default value
  '1': format.cyan.dim,
  '2': format.green.dim,
  '3': format.yellow.dim,
  '4': format.magenta.dim,
  '5': format.red.dim
}

function getFormatMethod(code: number) {
  const firstDigitOfCode = code.toString()[0]

  return MAP[firstDigitOfCode] || MAP[0]
}

function printCode(code: number, str?: string) {
  return getFormatMethod(code)((str || code).toString())
}

function printSourceCode(contentType: string, source: string) {
  if (contentType === 'application/json') {
    const object = JSON.parse(source)
    return util.inspect(object, {depth: null, colors: true})
  }
  return source.toString()
}

function echo(...args: any) {
  if (!Number.isInteger(args[0])) {
    process.stdout.write(`${util.format(args.join(' '))} \n`)
    return (...nextArgs: any) => {
      process.stdout.write(`${util.format(args.join(' '))} \n`)
    }
  } else {
    const padding = args[0]
    return (...nextArgs: any) => {
      process.stdout.write(`${util.format(_.repeat(' ', padding) + nextArgs.join(' '))} \n`)
    }
  }
}

function echon(...args: any) {
  if (!Number.isInteger(args[0])) {
    const padding = args[0]
    return (...nextArgs: string[]) => {
      process.stdout.write(`${util.format(_.repeat(' ', padding) + nextArgs.join(' '))}`)
    }
  } else {
    const padding = args[0]
    return (...nextArgs: any) => {
      process.stdout.write(`${util.format(_.repeat(' ', padding) + nextArgs.join(' '))}`)
    }
  }
  // process.stdout.write(`${util.format(args.join(' '))}`)
}

function error(...args: string[]) {
  if (args.length === 1 && !Number.isInteger(args[0])) {
    // args.unshift('ERROR:');
    process.stdout.write(util.format(format.red(args.join(' '), '\n')))
    return
  }

  if (Number.isInteger(args[0])) {
    const padding = args[0]
    return (...nextArgs) => {
      process.stdout.write(util.format(_.repeat(' ', padding) + format.red(nextArgs.join(' '), '\n')))
    }
  }

  process.stdout.write(util.format(format.red(args.join('\n\n'), '\n')))
}

function warning(...args: string[] | number[]) {
  if (args.length === 1 && !Number.isInteger(args[0])) {
    process.stdout.write(util.format(format.yellow(args.join(' '), '\n')))
    return
  }

  if (Number.isInteger(args[0])) {
    const padding = args[0]
    return (...nextArgs: string[]) => {
      process.stdout.write(util.format(_.repeat(' ', padding) + format.yellow(nextArgs.join(' '), '\n')))
    }
  }

  process.stdout.write(util.format(format.yellow(args.join('\n\n'), '\n')))
}

const p = (padding: number) => (string?: string) => {
  let str = ''
  if (string) {
    str = string.split('\n').join(`\n${_.repeat(' ', padding)}`)
  }
  return _.repeat(' ', padding) + str
}

export {
  MAP,
  getFormatMethod,
  printCode,
  printSourceCode,
  echo,
  echon,
  error,
  warning,
  p
}

module.exports = {
  MAP,
  getFormatMethod,
  printCode,
  printSourceCode,
  echo,
  echon,
  error,
  warning,
  p
}
