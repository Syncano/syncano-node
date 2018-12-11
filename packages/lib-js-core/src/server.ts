// tslint:disable-next-line:no-var-requires
const pjson = require('../package.json')
import Account from './account'
import Channel from './channel'
import Class from './class'
import Data from './data'
import Endpoint from './endpoint'
import Event from './event'
import Hosting from './hosting'
import Instance from './instance'
import Log, { Logger } from './logger'
import Registry from './registry'
import Response, { CustomResponse } from './response'
import Settings from './settings'
import Socket from './socket'
import Trace from './trace'
import Users from './users'

class Server {
  /**
   * Manage Syncano Classes
   */
  // tslint:disable-next-line:variable-name
  public _class: Class

  /**
   * Emit global events, to which other sockets can subscribe.
   */
  public event: Event

  /**
   * Send XHR requests to Syncano Endpoints
   */
  public endpoint: Endpoint

  /**
   * Publish events to Syncano Channels
   */
  public channel: Channel

  /**
   * Manage Syncano Sockets
   */
  public socket: Socket

  /**
   * Get Syncano Endpoint traces
   */
  public trace: Trace

  /**
   * Manage Syncano Hostings
   */
  public hosting: Hosting

  /**
   * Format HTTP responses
   */
  public response: CustomResponse

  /**
   * Manage Syncano Account
   */
  public account: Account

  /**
   * Manage Syncano Instances
   */
  public instance: Instance

  /**
   * Log debuging messages that can be viewed in Syncano CLI
   */
  public logger: Logger

  /**
   * Manage Syncano Users
   */
  public users: Users
  public registry: Registry

  /**
   * Manage Syncano Database. Create, update, query & list, delete objects.
   */
  public data: {
    [className: string]: Data
  }
  protected version: any
  protected majorVersion: any

  constructor (ctx: any = {}) {
    const settings = Settings(ctx)
    const getConfig = (className?: string) => Object.assign({className}, settings)
    const config = getConfig()

    this.version = pjson.version
    this.majorVersion = pjson.version.split('.')[0]

    this._class = new Class(config)
    this.event = new Event(config)
    this.endpoint = new Endpoint(config)
    this.channel = new Channel(config)
    this.socket = new Socket(config)
    this.trace = new Trace(config)
    this.hosting = new Hosting(config)
    this.response = Response(config)
    this.account = new Account(config)
    this.instance = new Instance(config)
    this.logger = Log(config)
    this.users = new Users(config)
    this.registry = new Registry(config)
    this.data = new Proxy(new Data(settings), {
      get (target, className: string) {
        return new Data(getConfig(className))
      }
    })
  }
}

export default Server
