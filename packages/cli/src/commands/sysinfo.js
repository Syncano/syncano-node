import os from 'os'
import childProcess from 'child_process'
import format from 'chalk'

import logger from '../utils/debug'
import { echo, echon } from '../utils/print-tools'

const { debug } = logger('cmd-sysinfo')

export default class SysInfoCmd {
  constructor (context) {
    debug('SysInfoCmd.constructor')
    this.context = context
    this.session = context.session
  }

  async run ([cmd]) {
    const npmVersion = childProcess.spawnSync('npm', ['-v'])
      .stdout
      .toString()
      .trim()

    echo()
    echon(2)(` ${format.dim('cli version')}:`)
    echo(` ${format.cyan(this.session.CLIVersion)}`)
    echon(2)(`${format.dim('node version')}:`)
    echo(` ${format.cyan(process.version)}`)
    echon(2)(` ${format.dim('npm version')}:`)
    echo(` ${format.cyan(npmVersion)}`)
    echon(2)(`    ${format.dim('platform')}:`)
    echo(` ${format.cyan(os.type)}`)
    echon(2)(`        ${format.dim('arch')}:`)
    echo(` ${format.cyan(process.arch)}`)
    echo()
  }
}
