import format from 'chalk'
import os from 'os'
import childProcess from 'child_process'

import { echo, echon } from '../utils/print-tools'
import Command from '../base_command'

export default class Logout extends Command {
  static description = 'Sys info for debug purpose'
  static flags = {}

  async run () {
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
    echo(` ${format.cyan(os.platform())}`)
    echon(2)(`        ${format.dim('arch')}:`)
    echo(` ${format.cyan(process.arch)}`)
    echo()
  }
}
