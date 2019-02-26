import format from 'chalk'
import childProcess from 'child_process'
import os from 'os'

import Command from '../base_command'

export default class Logout extends Command {
  static description = 'System info for debug purpose'
  static flags = {}

  async run() {
    const npmVersion = childProcess.spawnSync('npm', ['-v'])
      .stdout
      .toString()
      .trim()

    this.echo()
    this.echon(2)(` ${format.dim('cli version')}:`)
    this.echo(` ${format.cyan(this.session.CLIVersion)}`)
    this.echon(2)(`${format.dim('node version')}:`)
    this.echo(` ${format.cyan(process.version)}`)
    this.echon(2)(` ${format.dim('npm version')}:`)
    this.echo(` ${format.cyan(npmVersion)}`)
    this.echon(2)(`    ${format.dim('platform')}:`)
    this.echo(` ${format.cyan(os.platform())}`)
    this.echon(2)(`        ${format.dim('arch')}:`)
    this.echo(` ${format.cyan(process.arch)}`)
    this.echo()
    this.exit(0)
  }
}
