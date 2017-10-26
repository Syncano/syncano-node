import path from 'path'

function getInitTemplate (tempateName = 'default') {
  return `${path.dirname(require.resolve('../commands'))}/../../templates/project/${tempateName}/`
}

function getSocketTemplate (tempateName = 'empty') {
  return `${path.dirname(require.resolve('../commands'))}/../../templates/socket/${tempateName}/`
}

const builtInTemplates = [
  { name: 'empty', description: 'Empty Socket' },
  { name: 'example', description: 'Example Socket with one mocked endpoint (recommended)' }
]

export default {
  getInitTemplate,
  getSocketTemplate,
  builtInTemplates
}
