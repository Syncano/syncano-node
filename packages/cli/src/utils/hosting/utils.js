// import Promise from 'bluebird'
import fs from 'fs'
import path from 'path'
import dir from 'node-dir'
import glob from 'glob'

// const asyncDir = Promise.promisifyAll(dir)

function getFiles (directory) {
  // Ignore patterns from .syncanoignore file
  let ignore = []
  try {
    ignore = fs.readFileSync(path.join(directory, '.syncanoignore'), 'utf8').split('\n')
  } catch (err) {}

  return glob.sync(`**`, {
    cwd: directory,
    ignore,
    realpath: true,
    nodir: true
  }).map(file => {
    return {
      fullPath: file,
      internalPath: file.replace(`${directory}`, '')
    }
  })
  // }
  // return asyncDir.filesAsync(directory).catch((e) => e.code)
}

export default {
  getFiles,
  // asyncDir
}
