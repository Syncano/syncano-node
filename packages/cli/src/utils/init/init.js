import format from 'chalk'
import path from 'path'
import fs from 'fs-extra'

import session from '../session'
import logger from '../debug'
import { echo } from '../print-tools'
import { getTemplateSpec, getTemplate, builtInProjectTemplates } from '../templates'

const { debug } = logger('utils-init')

class Init {
  constructor () {
    this.session = session
  }

  static projectTemplates () {
    const installedTemplates = builtInProjectTemplates.map((templateName) => {
      debug('loading template:', templateName)
      const templateSpec = getTemplateSpec(templateName)

      return { name: templateName, description: templateSpec.description }
    })
    return installedTemplates
  }

  static getTemplatesChoices () {
    return Init.projectTemplates().map(template => `${template.description} ${format.grey(`- (${template.name})`)}`)
  }

  createFilesAndFolders (pathToCopyTo = process.cwd()) {
    debug('createFilesAndFolders()')

    try {
      debug('Template name:', this.templateName)
      debug('Path to copy to:', pathToCopyTo)
      fs.copySync(getTemplate(this.templateName), pathToCopyTo)
      echo(4)(format.dim(`Project has been created from ${format.green(this.templateName)} template.`))
      echo()
    } catch (err) {
      echo(err)
      throw err
    }
  }

  checkConfigFiles () {
    return !fs.existsSync(this.session.projectPath)
  }

  checkIfInitiated () {
    return fs.existsSync(this.session.projectPath) && this.session.project
  }

  addConfigFiles (projectParams = {}, projectPath) {
    if (projectPath) {
      this.session.settings.account.addProject(projectPath, projectParams)
    } else {
      this.session.settings.account.addProject(path.join(process.cwd(), 'syncano'), projectParams)
    }

    echo(4)(`Your project is attached to ${format.green(projectParams.instance)} instance now!`)
  }

  noConfigFiles () {
    debug('noConfigFiles()')
    this.createFilesAndFolders()
  }
}

export default Init
