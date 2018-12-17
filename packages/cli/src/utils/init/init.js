import fs from 'fs-extra'
import format from 'chalk'
import path from 'path'

import session from '../session'
import logger from '../debug'
import { echo } from '../print-tools'
import {
  getTemplateSpec,
  getTemplate,
  builtInProjectTemplates,
  installedProjectTemplates
} from '../templates'

const { debug } = logger('utils-init')

class Init {
  constructor () {
    this.session = session
  }

  static projectTemplates () {
    const allTemplates = builtInProjectTemplates.concat(installedProjectTemplates())
    const installedTemplates = allTemplates.map(templateName => {
      debug('loading template:', templateName)
      const templateSpec = getTemplateSpec(templateName)

      return { name: templateName, description: templateSpec.description }
    })
    return installedTemplates
  }

  static getTemplatesChoices () {
    return Init.projectTemplates()
      .map(template => `${template.description} ${format.grey(`- (${template.name})`)}`)
  }

  static getLocationChoices () {
    return [
      `eu1 ${format.grey(`- (Europe Belgium)`)}`,
      `us1 ${format.grey(`- (US Virginia)`)}`
    ]
  }

  createFilesAndFolders (pathToCopyTo = process.cwd()) {
    debug('createFilesAndFolders()')

    try {
      debug('Template name:', this.templateName)
      debug('Loction name:', this.locationName)
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

  async addConfigFiles (projectParams = {}, projectPath) {
    if (projectPath) {
      this.session.settings.account.addProject(projectPath, projectParams)
    } else {
      this.session.settings.account.addProject(path.join(process.cwd()), projectParams)
    }
    await this.session.load()
  }

  noConfigFiles () {
    debug('noConfigFiles()')
    this.createFilesAndFolders()
  }
}

export default Init
