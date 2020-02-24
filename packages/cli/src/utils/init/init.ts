import format from 'chalk'
import fs from 'fs-extra'
import path, {join} from 'path'

import logger from '../debug'
import {echo} from '../print-tools'
import session from '../session'
import {ProjectSettings} from '../../types'
import {
  builtInProjectTemplates,
  getTemplate,
  getTemplateSpec,
  installedProjectTemplates
} from '../templates'

const {debug} = logger('utils-init')

class Init {
  templateName: string | null = null
  locationName: string | null = null

  static projectTemplates() {
    const allTemplates = builtInProjectTemplates.concat(installedProjectTemplates())
    const installedTemplates = allTemplates.map(templateName => {
      debug('loading template:', templateName)
      const templateSpec = getTemplateSpec(templateName)

      return {name: templateName, description: templateSpec.description}
    })
    return installedTemplates
  }

  static getTemplatesChoices() {
    return Init.projectTemplates()
      .map(template => `${template.description} ${format.grey(`- (${template.name})`)}`)
  }

  static getLocationChoices() {
    return [
      `eu1 ${format.grey('- (Europe Belgium)')}`,
      `us1 ${format.grey('- (US Virginia)')}`
    ]
  }

  async createFilesAndFolders(pathToCopyTo = process.cwd()) {
    debug('createFilesAndFolders()')

    if (this.templateName) {
      try {
        debug('Template name:', this.templateName)
        debug('Location name:', this.locationName)
        debug('Path to copy to:', pathToCopyTo)
        await fs.copy(getTemplate(this.templateName), pathToCopyTo)
        echo(4)(format.dim(`Project has been created from ${format.green(this.templateName)} template.`))
        echo()
        return
      } catch (err) {
        console.log(err)
        echo(err)
        throw err
      }
    }

    throw Error('No template name!')
  }

  hasConfig() {
    return fs.existsSync(join(session.getProjectPath(), 'syncano.yml'))
  }

  checkConfigFiles() {
    return !fs.existsSync(session.getProjectPath())
  }

  checkIfInitiated() {
    return fs.existsSync(session.getProjectPath()) && session.project
  }

  async addConfigFiles(projectParams: ProjectSettings, projectPath?: string) {
    if (projectPath) {
      session.settings.account.addProject(projectPath, projectParams)
    } else {
      session.settings.account.addProject(path.join(process.cwd()), projectParams)
    }
    await session.load()
  }

  async noConfigFiles() {
    debug('noConfigFiles()')
    return this.createFilesAndFolders()
  }
}

export default Init
