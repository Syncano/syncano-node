export interface SyncanoContext<Args = {}> {
  args: Args
  meta: Meta
  config: Config
}

export interface User {
  id: number
  user_key: string
  username: string
}

export interface Meta {
  request: Request
  metadata: Metadata
  executed_by: string
  executor: string
  instance: string
  socket: string
  token: string
  user?: User
  api_host: string
  space_host: string
}

export interface Request {
  REQUEST_METHOD: string
  PATH_INFO: string
  HTTP_HOST: string
  HTTP_CONNECTION: string
  HTTP_CACHE_CONTROL: string
  HTTP_UPGRADE_INSECURE_REQUESTS: string
  HTTP_USER_AGENT: string
  HTTP_ACCEPT: string
  HTTP_ACCEPT_ENCODING: string
  HTTP_ACCEPT_LANGUAGE: string
  HTTP_COOKIE: string
  HTTP_ORIGIN: string
  REMOTE_ADDR: string
}

export interface Metadata {
  description: string
  response: Response
  [metaName: string]: any
}

export interface Response {
  [x: string]: ResponseObject
}

export interface ResponseObject {
  inputs?: object
  outputs?: object
  description?: object
  exit_code?: number
}

export interface Config {
  allow_full_access: boolean
  timeout: number
  [name: string]: any
}
