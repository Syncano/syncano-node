export interface SyncanoResponse<T> {
  next: string | null
  prev: string | null
  objects: T[]
}

export interface ObjectLinks {
  self: string
  [entity: string]: string
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
  acl: ACL
  channel: null
  channel_room: null
  links: {
    self: string
    [x: string]: string
  }
  [x: string]: any
}

export interface AccountData {
  id: number
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  has_password: boolean
  metadata: object
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
  author: AccountData
  details: BackupDetails
  metadata: any
  links: ObjectLinks
}
