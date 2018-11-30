// To use this util you need to initiate logger, e.g.:
// import logger from '../utils/debug';
// const { info, debug } = logger('<my_logger_name>');

import Raven from 'raven'
import printDebug from 'debug'


const logTypes = ['debug', 'info', 'warn', 'error']

const logger = (name) => {
  const functions = {}
  logTypes.forEach((type) => {
    functions[type] = (...args) => {
      args.forEach((arg, index) => {
        if (index === 0) {
          Raven.captureBreadcrumb({
            message: arg,
            category: name,
            level: type
          })
          printDebug(`${name}:${type}`)(arg)
        } else {
          printDebug(`${name}:${type}:verbose`)(arg)
        }
      })
    }
  })
  return functions
}

export default logger
