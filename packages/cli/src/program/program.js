/* eslint no-underscore-dangle: "warn" */
/* eslint no-param-reassign: "warn" */
import program from 'commander'
import format from 'chalk'
import stripAnsi from 'strip-ansi'
import { echo } from '../utils/print-tools'
import session from '../utils/session'

program.Command.prototype.missingArgument = (name) => {
  echo(`\nerror: ${format.cyan(`<${name}>`)} argument is ${format.red('required!')}`)
  program.outputHelp()
  process.exit(1)
}

program.Command.prototype.optionMissingArgument = (option, flag) => {
  if (flag) {
    echo(`\nerror: missing ${format.cyan(`<${option.flags}>`)} argument, got ${format.red(flag)}`)
  }

  if (!flag) {
    echo(`\nerror: ${format.cyan(`${option.flags}`)} argument is ${format.red('required!')}`)
  }

  program.outputHelp()
  process.exit(1)
}

program.Command.prototype.group = function (group) {
  this._group = group
  return this
}

// We are overriding this mainly to show separetly normal command and plugins
program.Command.prototype.commandHelp = () => {
  if (!program.commands.length) return ''

  // Search for plugins commands
  const plugins = Object.keys(session.getPluginsInstance().plugins)
  program.commands.forEach((cmd) => {
    if (!plugins.indexOf(cmd._name)) {
      // eslint-disable-next-line no-param-reassign
      cmd._plugin = true
    }
  })

  function humanReadableArgName (arg) {
    const nameOutput = arg.name + (arg.variadic === true ? '...' : '')
    return arg.required ? `${format.white(`<${(nameOutput)}>`)}` : `${format.grey(`[${(nameOutput)}]`)}`
  }

  function pad (str, width) {
    const len = Math.max(0, width - stripAnsi(str).length)
    return str + Array(len + 1).join(' ')
  }

  function printCmd (cmd) {
    const args = cmd._args.map((arg) => humanReadableArgName(arg)).join(' ')

    return [
      [
        format.cyan(cmd._name),
        (cmd._alias ? `|${cmd._alias}` : ''),
        format.grey((cmd.options.length ? ' [options]' : '')),
        ' ',
        args
      ].join(''),
      cmd._description
    ]
  }

  const commandGroups = {}
  // Grouping commands
  program
    .commands
    .filter((cmd) => !cmd._noHelp && !cmd._plugin && cmd._name !== 'help')
    .map((cmd) => {
      let group = ''
      if (cmd._group) {
        group = cmd._group
      } else {
        group = 'Other'
      }
      if (!commandGroups[group]) { commandGroups[group] = [] }
      commandGroups[group].push(printCmd(cmd))
      return printCmd(cmd)
    })

  // Plugins commands
  const pluginsCommands = program
    .commands
    .filter((cmd) => !cmd._noHelp && cmd._plugin)
    .map((cmd) => printCmd(cmd))

  function printList (commands, title) {
    const width = commands.reduce((max, command) => Math.max(max, stripAnsi(command[0]).length), 0)
    const comnds = commands.map((cmd) => {
      const desc = cmd[1] ? `    ${cmd[1]}` : ''
      return pad(cmd[0], width) + desc
    }).join('\n').replace(/^/gm, '    ')

    return [
      '',
      `  ${format.grey(title)}:`,
      '',
      comnds,
      ''
    ].join('\n')
  }

  let allCommands = []

  Object.keys(commandGroups).forEach((groupName) => {
    allCommands = allCommands.concat(printList(commandGroups[groupName], groupName))
  })

  const pluginsCommandsList = pluginsCommands.length ? printList(pluginsCommands, 'Plugins') : []

  return allCommands.join('').concat(pluginsCommandsList)
}

program.Command.prototype.helpInformation = function () {
  let currentInstance = ''
  if (session.project && session.project.instance) {
    const instanceName = session.project.instance
    currentInstance = instanceName ? `\n\n  Current Instance: ${format.yellow((instanceName))}` : ''
  }

  const desc = this._description ? [`  ${this._description}`, ''] : []
  const cmdName = this._alias ? `${this._name}|${this._alias}` : this._name
  const usage = [`\n  Usage: ${cmdName} ${this.usage()} ${currentInstance}`]

  const commandHelp = this.commandHelp()

  const cmds = commandHelp ? [commandHelp] : []
  const options = [
    '  Options:\n',
    `${this.optionHelp().replace(/^/gm, '    ')}\n\n`
  ]

  return usage
    .concat(cmds)
    .concat(desc)
    .concat(options)
    .join('\n')
}

export default program
