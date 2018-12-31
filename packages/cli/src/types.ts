import { SyncanoClass } from "@syncano/core";

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
  settings: any
  projectPath: string
  project: string
  userId: string
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
  src: string
  config: HostingRecordConfig
}

export interface ProjectSettingsAttributes {
  plugins: Record<string, string>
  templates: Record<string, string>
  hosting: Record<string, HostingRecord>
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
