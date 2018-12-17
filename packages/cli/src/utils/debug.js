// To use this util you need to initiate logger, e.g.:
// import logger from '../utils/debug';
// const { info, debug } = logger('<my_logger_name>');

import printDebug from 'debug'

const logTypes = ['debug', 'info', 'warn', 'error']
const debug = printDebug('cli')

const logger = (name) => {
  const functions = {}
  logTypes.forEach(type => {
    functions[type] = debug.extend(`${name}:${type}`)
  })
  return functions
}

export default logger
