import * as FormData from 'form-data'
import {default as Server} from './server'
export {
  ClassObject,
  User,
  UserGroup,
  BackupObject,
  SyncanoResponse,
  AccountOwner,
  ChannelResponse,
  ClassObjectLinks,
  Hosting,
  HostingFile,
  Instance,
  InstanceMetadata,
  InstanceOwner,
  LoginData,
  SchemaObject,
  Settings,
  Socket,
  SyncanoClass,
  Trace
} from './types'
import {BackupClass} from './backup'
import {DataClass} from './data'
export {Server as Core}
export {DataClass, BackupClass}
export {Context} from './context'
export default Server

module.exports = Server
module.exports.default = Server
module.exports.BackupClass = BackupClass
module.exports.DataClass = DataClass
module.exports.Core = Server
module.exports.FormData = FormData
