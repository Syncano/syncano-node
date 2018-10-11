import fs from 'fs'
import path from 'path'
import glob from 'glob'

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
  }).map(file => ({
    fullPath: file,
    internalPath: file.replace(`${directory}`, '')
  }))
}

export default {
  getFiles
}
