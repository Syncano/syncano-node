import fs from 'fs'
import path from 'path'
import logger from './debug'

const { debug } = logger('template')

const getTemplatePath = (templateName) => {
  return path.join(__dirname, '..', '..', 'node_modules', ...templateName.split('/'))
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
  '@syncano/template-socket-es6'
]

const builtInProjectTemplates = [
  '@syncano/template-project-empty',
  '@syncano/template-project-hello'
]

export default {
  getTemplate,
  getTemplateSpec,
  builtInSocketTemplates,
  builtInProjectTemplates
}
