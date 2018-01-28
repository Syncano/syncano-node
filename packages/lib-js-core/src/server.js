import pjson from '../package.json'
import Data from './data'
import Users from './users'
import Account from './account'
import Instance from './instance'
import Event from './event'
import Endpoint from './endpoint'
import Socket from './socket'
import Trace from './trace'
import Hosting from './hosting'
import Response from './response'
import Logger from './logger'
import Channel from './channel'
import Class from './class'
import Settings from './settings'
import Registry from './registry'

class Server {
  constructor (ctx = {}) {
    const settings = Settings(ctx)
    const getConfig = className => Object.assign({className}, settings)
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
    this.logger = Logger(config)
    this.users = new Users(config)
    this.registry = new Registry(config)
    this.data = new Proxy(new Data(settings), {
      get (target, className) {
        return new Data(getConfig(className))
      }
    })
  }
}

export default Server
