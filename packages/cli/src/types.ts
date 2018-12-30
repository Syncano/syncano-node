export interface CLIPlugin {
}
export interface CLIProgramContext {
}

export interface CLISession {
  settings: any
  projectPath: string
  project: string
  userId: string
  plugins: CLIPlugin[]
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
