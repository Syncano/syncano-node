import fs from 'fs'
import mkdirp from 'mkdirp'
import _ from 'lodash'
import path from 'path'
import Promise from 'bluebird'
import { transformFile } from 'babel-core'

import logger from '../debug'
import babelConfig from './babel-config'

const babelTransformFile = Promise.promisify(transformFile)
const writeFile = Promise.promisify(fs.writeFile)

const { debug } = logger('utils-compile')

function compileFile (fileObj) {
  debug('file to transform', fileObj.srcFile)
  const dirname = path.dirname(fileObj.compiledFile)
  const newMapFile = `${fileObj.compiledFile}.map`

  if (!fs.existsSync(dirname)) {
    mkdirp.sync(dirname)
  }

  debug('transforming file', fileObj.srcFile)
  return babelTransformFile(fileObj.srcFile, babelConfig())
    .then((result) =>
      Promise.all([
        writeFile(fileObj.compiledFile, result.code),
        writeFile(newMapFile, JSON.stringify(result.map))
      ])
    )
}

function compile (sockets, buildSourceMaps) {
  debug('compile')
  return new Promise((resolve, reject) => Promise.all(sockets.map((socket) => socket.getScriptsToCompile()))
      .then((allFiles) => _.flatten(allFiles))
      .then((files) => {
        debug('files to transform')
        return Promise.all(files.map((file) => compileFile(file)))
      })
      .then(() => {
        resolve()
      })
      .catch((err) => {
        reject({
          errorType: 'compilationError',
          error: err
        })
      }))
}

export default { compile }
