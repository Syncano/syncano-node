// To use this util you need to initiate logger, e.g.:
// import logger from '../utils/debug';
// const { info, debug } = logger('<my_logger_name>');

import Raven from 'raven'
import printDebug from 'debug'

const logTypes = ['debug', 'info', 'warn', 'error']
const debug = printDebug('cli')

const logger = (name) => {
  const functions = {}
  logTypes.forEach(type => {
    functions[type] = debug.extend(`${name}:${type}`)
  })
  // console.log(functions)
  return functions
      // return debug.extend(`${name}:${type}`)(args)
      // args.forEach((arg, index) => {
        // debug.extend(`${name}:${type}`)(arg)
        // if (index === 0) {
        //   Raven.captureBreadcrumb({
        //     message: arg,
        //     category: name,
        //     level: type
        //   })
        //   debug.extend(`${name}:${type}`)(arg)
        //   // printDebug(`${name}:${type}`)(arg)
        // } else {
        //   debug.extend(`${name}:${type}:verbose`)(arg)
        //   // printDebug(`${name}:${type}:verbose`)(arg)
        // }
      // })
    // }
  // })
  // return functions
}

export default logger
