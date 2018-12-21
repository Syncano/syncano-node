// tslint:disable-next-line:no-var-requires
const pjson = require('../package.json')
import * as logger from 'debug'
import {AccountClass} from './account'
import {BackupClass} from './backup'
import {ChannelClass} from './channel'
import Class from './class'
import {DataClass} from './data'
import {EndpointClass} from './endpoint'
import {EventClass} from './event'
import {GroupClass} from './group'
import {HostingClass} from './hosting'
import {InstanceClass} from './instance'
import Log, {Logger} from './logger'
import Response, {CustomResponse} from './response'
import Settings from './settings'
import {SocketClass} from './socket'
import {TraceClass} from './trace'
import {UserClass} from './user'

const debug = logger('syncano:core')

// tslint:disable-next-line:no-empty-interface
export interface InstanceDataSchema {}

class Server {
  /**
   * Manage Syncano Classes
   */
  // tslint:disable-next-line:variable-name
  public _class: Class

  /**
   * Emit global events, to which other sockets can subscribe.
   */
  public event: EventClass

  /**
   * Send XHR requests to Syncano Endpoints
   */
  public endpoint: EndpointClass

  /**
   * Publish events to Syncano Channels
   */
  public channel: ChannelClass

  /**
   * Manage Syncano Sockets
   */
  public socket: SocketClass

  /**
   * Get Syncano Endpoint traces
   */
  public trace: TraceClass

  /**
   * Manage Syncano Hostings
   */
  public hosting: HostingClass

  /**
   * Format HTTP responses
   */
  public response: CustomResponse

  /**
   * Manage Syncano Account
   */
  public account: AccountClass

  /**
   * Manage Syncano Instances
   */
  public instance: InstanceClass

  /**
   * Log debuging messages that can be viewed in Syncano CLI
   */
  public logger: Logger

  /**
   * Manage Syncano Backups
   */
  public backup: BackupClass

  /**
   * Manage Syncano Backups
   *
   * @deprecated Use `backup`
   */
  public backups: BackupClass

  /**
   * Manage Syncano Users
   */
  public user: UserClass

  /**
   * Manage Syncano Users
   *
   * @deprecated Use `user`
   */
  public users: UserClass

  /**
   * Manage Syncano User Groups
   */
  public group: GroupClass

  /**
   * Manage Syncano User Groups
   *
   * @deprecated Use `group`
   */
  public groups: GroupClass

  /**
   * Manage Syncano Database. Create, update, query & list, delete objects.
   */
  public data: {
    [className: string]: DataClass
  } & InstanceDataSchema
  protected version: any
  protected majorVersion: any

  constructor (ctx: any = {}) {
    const settings = Settings(ctx)
    const getConfig = (className?: string) => Object.assign({className}, settings)
    const config = getConfig()

    this.version = pjson.version
    this.majorVersion = pjson.version.split('.')[0]

    debug('%o', {version: this.version})

    this._class = new Class(config)
    this.event = new EventClass(config)
    this.endpoint = new EndpointClass(config)
    this.channel = new ChannelClass(config)
    this.socket = new SocketClass(config)
    this.trace = new TraceClass(config)
    this.hosting = new HostingClass(config)
    this.response = Response(config)
    this.account = new AccountClass(config)
    this.instance = new InstanceClass(config)
    this.logger = Log(config)
    this.user = new UserClass(config)
    this.group = new GroupClass(config)
    this.backup = new BackupClass(config)
    this.data = new Proxy(new DataClass(settings), {
      get (target, className: string) {
        return new DataClass(getConfig(className))
      }
    })

    // Deprecated
    this.users = new UserClass(config)
    this.groups = new GroupClass(config)
    this.backups = new BackupClass(config)
  }
}

export default Server
