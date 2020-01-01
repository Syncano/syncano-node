import {SyncanoClass} from '@syncano/core'

export interface CLIPlugin {
}

export type Location = 'eu1' | 'us1'

export interface SyncanoProject {
  instance: string
  location: Location
}

export interface SyncanoConnection {
}

export interface CLISession {
  CLIVersion: string
  settings: any
  projectPath: string
  project: SyncanoProject
  userId: number
  userEmail: string
  userFirstName: string
  userLastName: string
  majorVersion: string
  location: Location
  connection: SyncanoClass
}

// export interface CLIProgramContext {
//   name: string
//   settings: any
//   projectPath: string
//   project: string
//   userId: string
//   session: CLISession
//   plugins: CLIPlugin[]
// }

export interface ProjectSettings {
  instance?: string
}

export interface AccountSettingsAttributes {
  auth_key: string
  projects: Record<string, ProjectSettings>
}

export interface EndpointRecordConfig {
  file?: string
}

export interface ConfigRecordAttrs {
  value: string
  default: string
}

export interface SocketSettingsAttributes {
  version: string
  config: Record<string, ConfigRecordAttrs>
  endpoints: Record<string, EndpointRecordConfig>
}

export interface ProjectSettings {
  instance?: string
}

export interface HostingRecordConfig {
  browser_router: boolean
}

export interface HostingRecord {
  name: string
  src: string
  config: HostingRecordConfig
}

export interface ProjectSettingsAttributes {
  plugins?: Record<string, string>
  templates?: Record<string, string>
  hosting?: Record<string, HostingRecord>
}

export interface InitClass {}
export interface HostingClass {}
export interface SocketClass {}

export interface CLIContext {
  Init: InitClass,
  Hosting: HostingClass,
  Socket: SocketClass,
  session: CLISession,
}

export interface HostingParams {
  name: string
  src: string
  cname?: string
  browser_router?: boolean
  removeCNAME?: boolean
}

export interface UpdateSocketZipReponse {
  status: 'stopped' | 'ok'
}

export interface SocketJSON {
  name: string
  endpoints?: any
  config?: any
  event_handlers?: any
  events?: any
}