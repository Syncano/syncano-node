import _ from 'lodash'
import Table from 'cli-table2'
import format from 'chalk'
import { error, echo, echon } from '../utils/print-tools'

export default class SocketSearchCmd {
  constructor (context) {
    this.context = context
    this.session = context.session
    this.registry = new context.Registry()
  }

  run ([keyword, cmd]) {
    this.keyword = keyword
    this.table = new Table({
      head: ['', '', 'name', 'description', 'author', 'version', 'keywords'],
      colWidths: [2, 2, null, 50, null, null],
      wordWrap: cmd.long,
      style: {
        'padding-left': 0,
        'padding-right': 0
      },
      chars: {
        top: '',
        'top-mid': '',
        'top-left': '',
        'top-right': '',
        bottom: '',
        'bottom-mid': '',
        'bottom-left': '',
        'bottom-right': '',
        left: '',
        'left-mid': '',
        mid: '',
        'mid-mid': '',
        right: '',
        'right-mid': '',
        middle: ' '
      }
    })

    try {
      const sockets = this.registry.searchSocketsByAll(keyword)
      sockets.forEach(this.addRecord.bind(this))
      echo(6)(`${format.cyan(sockets.length)} socket(s) found: `)
      echo()
      echo(this.table.toString())
      echo()
      if (SocketSearchCmd.printLegend(sockets)) {
        echo()
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        echo(4)('No sockets found 😕')
        echon(4)(`Search takes ${format.cyan('name')}, ${format.cyan('description')} `)
        echo(`and ${format.cyan('keywords')} into account. Try again!`)
        echo()
        process.exit()
      } else {
        echo()
        error(4)(err)
        echo()
        process.exit(1)
      }
    }
  }

  addRecord (socket) {
    const arrayData = [
      socket.is_mine ? ' 👷' : '',
      socket.private ? '🔒 ' : '',
      socket.name,
      socket.description,
      socket.author,
      socket.version,
      socket.keywords ? socket.keywords.join(', ') : ''
    ]
    const socketData = arrayData.map((item) => this.colorResponse(item))
    this.table.push(socketData)
  }

  colorResponse (item) {
    const foundTerm = item && item.match(new RegExp(this.keyword, 'i'))
    if (foundTerm) {
      return item.replace(foundTerm, format.green(foundTerm))
    }
    return item
  }

  static printLegend (sockets) {
    const privateSockets = _.filter(sockets, { private: true })
    const mineSockets = _.filter(sockets, { is_mine: true })

    if (mineSockets.length > 0 || privateSockets.length > 0) {
      echon(6)()
      if (mineSockets.length > 0) {
        echon('👷  your socket')
      }
      if (privateSockets.length > 0) {
        if (mineSockets.length > 0) {
          echon(', ')
        }
        echon('🔒  private socket')
      }
      echo()
      return true
    }
  }
}
