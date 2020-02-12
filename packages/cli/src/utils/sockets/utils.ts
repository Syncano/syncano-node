import format from 'chalk'
import fs from 'fs'
import YAML from 'js-yaml'
import path from 'path'
import walkdir from 'walkdir'

import logger from '../debug'
import session from '../session'
import {builtInSocketTemplates, getTemplateSpec, installedSocketTemplates} from '../templates'
import SourceMap from 'source-map'
import {SocketBasicInfo} from '../../types'

const {debug} = logger('utils-sockets-utils')

const socketTemplates = () => {
  const installedTemplatesNames = installedSocketTemplates()
  const allTemplatesNames = builtInSocketTemplates.concat(installedTemplatesNames)

  const installedTemplates = allTemplatesNames.map(templateName => {
    debug('loading template:', templateName)
    const templateSpec = getTemplateSpec(templateName)

    return {name: templateName, description: templateSpec.templateLongDesc}
  })
  return installedTemplates
}

const getTemplatesChoices = () => socketTemplates().map(socketTemplate =>
  `${socketTemplate.description} - ${format.grey(`(${socketTemplate.name})`)}`)

type SocketLocalConfig = {
  name: string
}

const searchForSockets = (socketsPath: string, maxDepth = 3): Record<string, SocketLocalConfig> => {
  if (!fs.existsSync(socketsPath)) {
    return {}
  }

  const sockets: Record<string, SocketLocalConfig> = {}

  const options = {
    follow_symlinks: true,
    max_depth: maxDepth
  }

  // TODO: optimize only diging deeper scoped modues
  walkdir.sync(socketsPath, options, (walkPath) => {
    if (walkPath.match(/socket.yml$/) && !path.dirname(walkPath).match(/\/\./)) {
      const socketYML = YAML.load(fs.readFileSync(walkPath, 'utf8')) || {}
      sockets[walkPath] = <SocketLocalConfig>socketYML
    }
  })

  return sockets
}

const findLocalPath = (socketName: string) => {
  debug('findLocalPath')
  let socketPath = null
  const projectPath = session.getProjectPath() || process.cwd()

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
  const socketsPath = path.join(session.getProjectPath(), 'syncano')
  Object.entries(searchForSockets(socketsPath)).forEach(([walkPath, socket]) => {

    if (socket.name === socketName) {
      socketPath = path.dirname(walkPath)
    }
  })

  if (!socketPath) {
    const nodeModPath = path.join(session.getProjectPath(), 'node_modules')
    Object.entries(searchForSockets(nodeModPath)).forEach(([file, socket]) => {
      if (socket.name === socketName) {
        socketPath = path.dirname(file)
      }
    })
  }

  return socketPath
}

// Listing sockets
// list sockets based on project path
// const listLocal = () => {
//   debug('listLocal', session.projectPath)

//   const singleSocketPath = path.join(session.projectPath)
//   const singleSocket = searchForSockets(singleSocketPath, 1).map(([file, socket]) => socket.name)

//   const localPath = path.join(session.projectPath, 'syncano')
//   const localSockets = searchForSockets(localPath).map(([file, socket]) => socket.name)

//   const nodeModPath = path.join(session.projectPath, 'node_modules')
//   const nodeModSockets = searchForSockets(nodeModPath).map(([file, socket]) => socket.name)

//   return localSockets.concat(singleSocket, nodeModSockets)
// }

const getSocketBasicInfo = async (socketsPath: string, maxDepth = 3) => {
  debug(`#getSocketBasicInfo - ${socketsPath}`)
  const sockets = new Set<SocketBasicInfo>()

  if (!fs.existsSync(socketsPath)) {
    return Array.from(sockets)
  }

  const options = {
    follow_symlinks: true,
    max_depth: maxDepth
  }

  // TODO: optimize only digging deeper scoped modules
  await walkdir.async(socketsPath, options, walkPath => {
    if (walkPath.match(/socket.yml$/) && !path.dirname(walkPath).match(/\/\./)) {
      const content = fs.readFileSync(walkPath, 'utf8')
      const socketName = content.match(/^name: ([\w-_]+)/)
      sockets.add({
        socketName: socketName[1],
        socketPath: path.dirname(walkPath)
      })
    }
  })

  debug(`/getSocketBasicInfo - ${socketsPath}: ${JSON.stringify(Array.from(sockets))}`)

  return Array.from(sockets)
}

const listLocal = async (): Promise<SocketBasicInfo[]> => {
  debug('listLocal', session.getProjectPath())

  const singleSocketPath = path.join(session.getProjectPath())
  const localPath = path.join(session.getProjectPath(), 'syncano')
  const nodeModPath = path.join(session.getProjectPath(), 'node_modules')

  const [singleSocket, localSockets, nodeModSockets] = await Promise.all([
    getSocketBasicInfo(singleSocketPath, 1),
    getSocketBasicInfo(localPath),
    getSocketBasicInfo(nodeModPath),
  ])

  return localSockets.concat(singleSocket, nodeModSockets)
}

const getOrigFilePath = (origFileLine: SourceMap.NullableMappedPosition) => {
  let origFilePath
  if (origFileLine && origFileLine.source) {
      const match = origFileLine.source.match(/webpack:\/\/\/(.*\.js)(\?|$)/)
    if (match && match.length > 1) {
      origFilePath = match[1]
    }

    if (origFilePath && origFilePath.match(/~\//)) {
      origFilePath = origFilePath.replace('~', 'node_modules')
    }
    return origFilePath
  }
}

const deleteFolderRecursive = (folder: string) => {
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

export {
  deleteFolderRecursive,
  getTemplatesChoices,
  findLocalPath,
  listLocal,
  getOrigFilePath
}

export default {
  deleteFolderRecursive,
  getTemplatesChoices,
  findLocalPath,
  listLocal,
  getOrigFilePath
}
