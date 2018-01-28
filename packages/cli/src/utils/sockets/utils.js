import fs from 'fs'
import YAML from 'js-yaml'
import path from 'path'
import format from 'chalk'

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

const searchForSockets = (projectPath) => {
  const sockets = []

  const dirs = (p) => fs.readdirSync(p).filter((f) => fs.statSync(path.join(p, f)).isDirectory())

  dirs(projectPath).forEach((dir) => {
    const socketFile = path.join(projectPath, dir, 'socket.yml')
    if (fs.existsSync(socketFile)) {
      const socket = YAML.load(fs.readFileSync(socketFile, 'utf8')) || {}
      sockets.push([socketFile, socket])
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

  searchForSockets(projectPath).forEach(([file, socket]) => {
    if (socket.name === socketName) {
      socketPath = path.dirname(file)
    }
  })

  return socketPath
}

// Listing sockets
// list sockets based on project path
const listLocal = () => {
  debug('listLocal')
  return searchForSockets(session.projectPath).map(([file, socket]) => socket.name)
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
