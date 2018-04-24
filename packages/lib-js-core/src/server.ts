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
  // tslint:disable-next-line:variable-name
  public _class: Class
  public event: Event
  public endpoint: Endpoint
  public channel: Channel
  public socket: Socket
  public trace: Trace
  public hosting: Hosting
  public response: CustomResponse
  public account: Account
  public instance: Instance
  public logger: Logger
  public users: Users
  public registry: Registry
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
