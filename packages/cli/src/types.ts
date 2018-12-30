import { SyncanoClass } from "@syncano/core";

export interface CLIPlugin {
}
export interface CLIProgramContext {
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

export interface CLIProgramContext {
  name: string
  settings: any
  projectPath: string
  project: string
  userId: string
  session: CLISession
  plugins: CLIPlugin[]
}
