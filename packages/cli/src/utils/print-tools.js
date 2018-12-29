import _ from 'lodash'
import format from 'chalk'
import util from 'util'

const MAP = {
  0: format.cyan.dim, // default value
  1: format.cyan.dim,
  2: format.green.dim,
  3: format.yellow.dim,
  4: format.magenta.dim,
  5: format.red.dim
}

function getFormatMethod (code) {
  const firstDigitOfCode = code.toString()[0]

  return MAP[firstDigitOfCode] || MAP[0]
}

function printCode (code, str) {
  return getFormatMethod(code)(str || code)
}

function printSourceCode (contentType, source) {
  if (contentType === 'application/json') {
    const object = JSON.parse(source)
    return util.inspect(object, { depth: null, colors: true })
  }
  return source.toString()
}

function echo (...args) {
  if (Number.isInteger(args[0])) {
    const padding = args[0]
    return (...nextArgs) => {
      process.stdout.write(`${util.format(_.repeat(' ', padding) + nextArgs.join(' '))} \n`)
    }
  }
  process.stdout.write(`${util.format(args.join(' '))} \n`)
}

function echon (...args) {
  if (Number.isInteger(args[0])) {
    const padding = args[0]
    return (...nextArgs) => {
      process.stdout.write(`${util.format(_.repeat(' ', padding) + nextArgs.join(' '))}`)
    }
  }
  process.stdout.write(`${util.format(args.join(' '))}`)
}

function error (...args) {
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

function warning (...args) {
  if (args.length === 1 && !Number.isInteger(args[0])) {
    process.stdout.write(util.format(format.yellow(args.join(' '), '\n')))
    return
  }

  if (Number.isInteger(args[0])) {
    const padding = args[0]
    return (...nextArgs) => {
      process.stdout.write(util.format(_.repeat(' ', padding) + format.yellow(nextArgs.join(' '), '\n')))
    }
  }

  process.stdout.write(util.format(format.yellow(args.join('\n\n'), '\n')))
}

const p = (padding) => (string) => {
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
