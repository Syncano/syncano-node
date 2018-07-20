import _ from 'lodash'
import format from 'chalk'
import Table from 'cli-table3'
import prettyBytes from 'pretty-bytes'
import { echo, error, warning } from '../utils/print-tools'
import Hosting from '../utils/hosting'

export default class HostingFilesCmd {
  constructor (context) {
    this.context = context
    this.session = context.session
  }

  static fillTable (files, table) {
    files.forEach((file) => {
      table.push([
        file.path,
        { hAlign: 'right', content: prettyBytes(file.size) },
        { hAlign: 'right', content: file.isSynced ? format.green('✓') : format.red('✗') },
        { hAlign: 'right', content: file.isUpToDate ? format.green('✓') : format.red('✗') }
      ])
    })

    return table
  }

  static echoResponse (hostingName, files, filledTable, totalSize) {
    if (!files.length) {
      return warning('There are no files in this hosting')
    }

    echo(4)(`Hosting ${format.cyan(hostingName)} has ${format.cyan(files.length)} files:`)
    echo()
    echo(filledTable.toString())
    echo()
    echo(4)(`You have ${files.length} files, ${format.cyan(prettyBytes(totalSize))} in total.`)
    echo()
  }

  async run ([hostingName, cmd]) {
    let hosting = null
    if (cmd.socket) {
      // TODO: implement Socket-based hosting
    } else {
      hosting = await Hosting.get(hostingName)
    }

    if (!hosting) {
      error(`There are no hostings configured for the "${this.attributes.name}" socket!`)
      process.exit()
    }

    const table = new Table({
      head: ['path',
        { hAlign: 'right', content: 'size' },
        { hAlign: 'right', content: 'uploaded' },
        { hAlign: 'right', content: 'up to date' }
      ],
      colWidths: [null, null, 15, 15],
      style: { 'padding-left': 4, 'padding-right': 0 },
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

    const files = await hosting.listFiles()
    const totalSize = _.sum(_.map(files, 'size'))
    const filledTable = HostingFilesCmd.fillTable(files, table)

    HostingFilesCmd.echoResponse(hostingName, files, filledTable, totalSize)
  }
}
