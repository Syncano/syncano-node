import format from 'chalk'
import Table from 'cli-table3'
import _ from 'lodash'
import prettyBytes from 'pretty-bytes'

import Command from '../../base_command'
import Hosting from '../../utils/hosting'

export default class HostingFilesCmd extends Command {
  static description = 'List hostings files'
  static flags = {}
  static args = [{
    name: 'hostingName',
    description: 'name of the hosting to list files from',
    required: true
  }]

  static fillTable(files, table) {
    files.forEach(file => {
      table.push([
        file.path,
        {hAlign: 'right', content: prettyBytes(file.size)},
        {hAlign: 'right', content: file.isSynced ? format.green('✓') : format.red('✗')},
        {hAlign: 'right', content: file.isUpToDate ? format.green('✓') : format.red('✗')}
      ])
    })

    return table
  }

  echoResponse(hostingName, files, filledTable, totalSize) {
    if (!files.length) {
      return this.warn('There are no files in this hosting')
    }

    this.echo(4)(`Hosting ${format.cyan(hostingName)} has ${format.cyan(files.length)} files:`)
    this.echo()
    this.echo(filledTable.toString())
    this.echo()
    this.echo(4)(`You have ${files.length} files, ${format.cyan(prettyBytes(totalSize))} in total.`)
    this.echo()
  }

  async run() {
    await this.session.isAuthenticated() || this.exit(1)
    await this.session.hasProject() || this.exit(1)
    const {args} = this.parse(HostingFilesCmd)

    const hostingName = args.hostingName
    const hosting = await Hosting.get(hostingName)

    if (!hosting) {
      this.echo(`There is no hosting ${hostingName}!`)
      this.exit(1)
    }

    const table = new Table({
      head: ['path',
        {hAlign: 'right', content: 'size'} as any,
        {hAlign: 'right', content: 'uploaded'} as any,
        {hAlign: 'right', content: 'up to date'} as any
      ],
      colWidths: [null, null, 15, 15],
      style: {'padding-left': 4, 'padding-right': 0},
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

    this.echo()
    this.echoResponse(hostingName, files, filledTable, totalSize)
  }
}
