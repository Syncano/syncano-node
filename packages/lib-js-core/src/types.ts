export interface SyncanoResponse<T> {
  next: string | null
  prev: string | null
  objects: T[]
}

export interface ACL {
  [className: string]: string[] | {
    [id: string]: string[]
  }
}

export interface User {
  id: number
  username: string
  user_key: string
  created_at: string
  updated_at: string
}

export interface UserGroup {
  id: number
  name: string
  label: string
  description: string
}

export interface ClassObject {
  id: number
  created_at: string
  updated_at: string
  revision: number
}

export interface ClassObjectLinks {
  self: string
  [entity: string]: string
}

export interface AccountOwner {
  id: number
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  has_password: boolean
  metadata: object
}

export interface LoginData extends AccountOwner {
  account_key: string
}

export interface BackupObject {
  id: number
  instance: string
  created_at: string
  updated_at: string
  size: number | null
  status: string
  status_info: string
  description: string
  label: string
  author: AccountOwner
  details: BackupDetails
  metadata: any
  links: ClassObjectLinks
}

export interface BackupDetails {
  response_template: {
    count: number
    list?: Array<string|number>
  }
  class: {
    count: number
    list?: Array<string|number>
  }
  socket: {
    count: number
    list?: Array<string|number>
  }
  script: {
    count: number
    list?: Array<string|number>
  }
  data_object: {
    count: number
    list?: Array<string|number>
  }
  hosting: {
    count: number
    list?: Array<string|number>
  }
  hosting_file: {
    count: number
    list?: Array<string|number>
  }
}

export interface Trace {
  meta: {
    REQUEST_METHOD: string
    PATH_INFO: string
    HTTP_HOST: string
    HTTP_CONNECTION: string
    HTTP_UPGRADE_INSECURE_REQUESTS: string
    HTTP_USER_AGENT: string
    HTTP_ACCEPT: string
    HTTP_ACCEPT_ENCODING: string
    HTTP_ACCEPT_LANGUAGE: string
    HTTP_COOKIE: string
    REMOTE_ADDR: string
  }
  id: number
  status: string
  executed_at: string
  duration: number
  links: {
    self: string
    [x: string]: string
  }
}

export interface Socket {
  name: string
  description: string
  created_at: string
  updated_at: string
  version: string
  status: string
  status_info: any
  install_url: any
  metadata: {
    name: string
    keywords: string[]
    sources: {
      [x: string]: string
    }
  }
  config: object
  installed: {
    endpoints: {
      [endpointName: string]: {
        script: string
        runtime: string
      }
    }
    classes: {
      [className: string]: {
        [fieldName: string]: string
      }
    }
  }
  files: {
    [fileName: string]: {
        checksum: string
        size: number
        file: string
        helper: boolean
    }
  }
  environment: string
  links: {
    self: string
    update: string
    endpoints: string
    handlers: string
    zip_file: string
    [x: string]: string
  }
}

export interface Settings {
  meta: any
  token?: string
  socket?: string
  instanceName?: string
  setResponse?: any
  HttpResponse?: any
}

export interface InstanceOwner extends AccountOwner {
  metadata: InstanceMetadata
}

export interface InstanceMetadata {
  icon?: string
  color?: string
  [x: string]: any
}

export interface Instance {
  name: string
  description: string
  owner: InstanceOwner
  created_at: string
  updated_at: string
  role: string
  location: string
  metadata: InstanceMetadata
  links: {
    self: string
    admins: string
    snippets: string
    endpoints: string
    push_notification: string
    classes: string
    invitations: string
    api_keys: string
    triggers: string
    schedules: string
    users: string
    groups: string
    channels: string
    batch: string
    rename: string
    backups: string
    restores: string
    hosting: string
    'classes-acl': string
    'channels-acl': string
    'script-endpoints-acl': string
    'groups-acl': string
    'users-schema': string
    'triggers-emit': string
    sockets: string
    'sockets-install': string
    environments: string
    [x: string]: string
  }
}

export interface Hosting {
  name: string
  is_default: boolean
  description: string
  created_at: string
  updated_at: string
  domains: string[]
  is_active: boolean
  ssl_status: string
  auth: object
  config: {
    browser_router: boolean
  }
  links: {
    self: string
    files: string
    set_default: string
    enable_ssl: string
    [x: string]: string
  }
}

export interface HostingFile {
  id: number
  path: string
  size: number
  checksum: string
  links: {
    self: string
    [x: string]: string
  }
}

export interface SyncanoClass {
  name: string
  description: string
  schema: SchemaObject[]
  status: string
  created_at: string
  updated_at: string
  objects_count: number
  revision: number
  metadata: object
}

export interface SchemaObject {
  name: string
  type: 'reference'|'relation'|'text'|'string'|'file'|'object'|'array'|'geopoint'|'integer'|'float'|'boolean'|'datetime'
  order_index?: boolean
  filter_index?: boolean
  unique?: boolean
  target?: string
}

export interface ChannelResponse<T> {
  id: number
  room: string
  created_at: string
  action: string
  author: {
    admin: number
  }
  metadata: {
    type: string
  }
  payload: T
  links: {
    self: string
    [x: string]: string
  }
}
