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
    .command('list')
    .group('Instance')
    .description('List all your instances')
    .action(async (...options: any[]) => {
      session.isAuthenticated()
      echo()
      new commands.InstanceList(context).run(options)
    })

  program
    .command('create <instanceName>')
    .group('Instance')
    .description('Create an Instance')
    .option('-l, --location <location>', 'Location of the instance - us1 (default) or eu1')
    .action(async (...options) => {
      session.isAuthenticated()
      echo()
      new commands.InstanceCreate(context).run(options)
    })

  program
    .command('delete <instanceName>')
    .group('Instance')
    .description('Delete an Instance')
    .action(async (...options) => {
      session.isAuthenticated()
      echo()
      new commands.InstanceDelete(context).run(options)
    })

  program
    .on('*', (commandsArr) => validateCommands(commandsArr))

  if (!process.argv.slice(2).length) {
    program.outputHelp()
  }

  program.parse(process.argv)
}

setup()
