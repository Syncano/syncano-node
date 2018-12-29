import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import logger from './debug'

const { debug } = logger('template')

const getTemplatePath = (templateName) => {
  debug('getTemplatePath', templateName)
  const options = { paths: [path.join(process.cwd(), 'node_modules')] }
  return path.dirname(require.resolve(templateName, options))
}

const getTemplateSpec = (templateName) => {
  const templatePath = getTemplatePath(templateName)
  debug('getTemplateSpec', templatePath)
  return JSON.parse(
    fs.readFileSync(path.join(templatePath, 'package.json'))
  )
}

function getTemplate (templateName) {
  debug('getTemplate', templateName)
  const templatePath = getTemplatePath(templateName)
  return path.join(templatePath, 'template')
}

const builtInSocketTemplates = [
  '@syncano/template-socket-vanilla',
  '@syncano/template-socket-es6',
  '@syncano/template-socket-es6-validate'
]

const builtInProjectTemplates = [
  '@syncano/template-project-empty',
  '@syncano/template-project-hello'
]

const findInstalledTemplates = (pattern) => {
  debug('findInstalledTemplates', pattern)
  try {
    const configFile = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json')))
    const regex = new RegExp(pattern)
    const devDeps = _.findKey(configFile.devDependencies, (obj, key) => key.match(regex))
    const deps = _.findKey(configFile.dependencies, (obj, key) => key.match(regex))
    return [].concat(devDeps || [], deps || [])
  } catch (err) {
    debug(err)
    return []
  }
}

const installedProjectTemplates = () => {
  return findInstalledTemplates('syncano-template-project')
}

const installedSocketTemplates = () => {
  return findInstalledTemplates('syncano-template-socket')
}

export {
  getTemplate,
  getTemplateSpec,
  builtInSocketTemplates,
  builtInProjectTemplates,
  installedProjectTemplates,
  installedSocketTemplates
}
