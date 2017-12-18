#!/usr/bin/env node
import program from './program'
import commands from './commands'
import session from './utils/session'
import context from './utils/context'
import validateCommands from './utils/validate-commands'
import { echo } from './utils/print-tools'

const setup = async () => {
  await context.session.load()

  program
    .command('link <path>')
    .group('Components')
    .description('Link all components to your project')
    .action(async (...options) => {
      session.isAuthenticated()
      session.hasProject()
      echo()
      new commands.ComponentLink(context).run(options)
    })

  program
    .command('list')
    .group('Components')
    .description('List all components')
    .action(async (...options) => {
      session.isAuthenticated()
      session.hasProject()
      echo()
      new commands.ComponentList(context).run(options)
    })

  program
    .on('*', (commandsArr) => validateCommands(commandsArr))

  if (!process.argv.slice(2).length) {
    program.outputHelp()
  }

  program.parse(process.argv)
}

setup()
