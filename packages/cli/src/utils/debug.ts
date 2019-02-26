// To use this util you need to initiate logger, e.g.:
// import logger from '../utils/debug';
// const { info, debug } = logger('<my_logger_name>');

import printDebug, {IDebugger} from 'debug'

// TODO: find how to simplify it
interface Logger {
  debug: IDebugger
  info: IDebugger
  warn: IDebugger
  error: IDebugger
}

const logTypes = ['debug', 'info', 'warn', 'error']
const debug = printDebug('cli')

const logger = (name: string) => {
  const functions = {} as Logger
  logTypes.forEach(type => {
    functions[type] = debug.extend(`${name}:${type}`)
  })
  return functions
}

export default logger
