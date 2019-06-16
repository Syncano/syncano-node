import AccountSettings from './accountSettings'
import ProjectSettings from './projectSettings'
import getSocketSettings from './socketSettings'

export {ProjectSettings, AccountSettings}

export default function (projectPath?: string) {
  return {
    project: new ProjectSettings(projectPath),
    account: new AccountSettings(),
    getSocketSettings
  }
}
