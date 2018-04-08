import fs from 'fs'
import YAML from 'js-yaml'
import path from 'path'
import format from 'chalk'
import walkdir from 'walkdir'

import logger from '../debug'
import session from '../session'
import { getTemplateSpec, builtInSocketTemplates, installedSocketTemplates } from '../templates'

const { debug } = logger('utils-sockets-utils')

const socketTemplates = () => {
  const installedTemplatesNames = installedSocketTemplates()
  const allTemplatesNames = builtInSocketTemplates.concat(installedTemplatesNames)

  const installedTemplates = allTemplatesNames.map(templateName => {
    debug('loading template:', templateName)
    const templateSpec = getTemplateSpec(templateName)

    return { name: templateName, description: templateSpec.templateLongDesc }
  })
  return installedTemplates
}

const getTemplatesChoices = () => socketTemplates().map(socketTemplate =>
    `${socketTemplate.description} - ${format.grey(`(${socketTemplate.name})`)}`)

const searchForSockets = (socketsPath) => {
  if (!fs.existsSync(socketsPath)) {
    return []
  }
  const sockets = []

  const options = {
    'follow_symlinks': true,
    'max_depth': 3
  }

  // TODO: optimize only diging deeper scoped modues
  walkdir.sync(socketsPath, options, (path, stat) => {
    if (path.match(/socket.yml$/)) {
      const socket = YAML.load(fs.readFileSync(path, 'utf8')) || {}
      sockets.push([path, socket])
    }
  })

  return sockets
}

const findLocalPath = (socketName) => {
  debug('findLocalPath')
  let socketPath = null
  const projectPath = session.projectPath || process.cwd()

  if (!fs.existsSync(projectPath)) {
    return socketPath
  }

  const socketInCurrentPath = path.join(projectPath, 'socket.yml')
  if (fs.existsSync(socketInCurrentPath)) {
    const socket = YAML.load(fs.readFileSync(socketInCurrentPath, 'utf8')) || {}
    if (socket.name === socketName) {
      return path.dirname(socketInCurrentPath)
    }
  }

  // Search for syncano folder
  const socketsPath = path.join(session.projectPath, 'syncano')
  searchForSockets(socketsPath).forEach(([file, socket]) => {
    if (socket.name === socketName) {
      socketPath = path.dirname(file)
    }
  })

  if (!socketPath) {
    const nodeModPath = path.join(session.projectPath, 'node_modules')
    searchForSockets(nodeModPath).forEach(([file, socket]) => {
      if (socket.name === socketName) {
        socketPath = path.dirname(file)
      }
    })
  }

  return socketPath
}

// Listing sockets
// list sockets based on project path
const listLocal = () => {
  debug('listLocal', session.projectPath)

  const localPath = path.join(session.projectPath, 'syncano')
  const localSockets = searchForSockets(localPath).map(([file, socket]) => socket.name)

  const nodeModPath = path.join(session.projectPath, 'node_modules')
  const nodeModSockets = searchForSockets(nodeModPath).map(([file, socket]) => socket.name)

  return localSockets.concat(nodeModSockets)
}

const getOrigFilePath = (origFileLine) => {
  let origFilePath = origFileLine.source.match(/webpack:\/\/\/(.*\.js)(\?|$)/)[1]

  if (origFilePath.match(/~\//)) {
    origFilePath = origFilePath.replace('~', 'node_modules')
  }
  return origFilePath
}

const deleteFolderRecursive = (folder) => {
  if (fs.existsSync(folder)) {
    fs.readdirSync(folder).forEach((file, index) => {
      const curPath = path.join(folder, file)
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(folder)
  }
}

export default {
  deleteFolderRecursive,
  getTemplatesChoices,
  findLocalPath,
  listLocal,
  getOrigFilePath
}
