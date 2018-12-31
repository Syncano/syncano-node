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
    .command('add <path>')
    .group('Hosting')
    .description('Create a new hosting')
    .option('-n, --hosting-name <name>', 'Name of the hosting')

    .option('--browser-router-on', 'Turn on browser router for a hosting')
    .option('--browser-router-off', 'Turn off browser router for a hosting')

    .option('--dont-sync', 'Do not sync files after adding hosting')
    .option('--sync', 'Sync files after adding hosting')

    .option('--without-cname', 'No CNAME')
    .option('-c, --cname <cname>', 'CNAME')

    .action(async (...options) => {
      session.isAuthenticated()
      session.hasProject()
      echo()
      new commands.HostingAdd(context).run(options)
    })

  program
    .command('delete <name>')
    .group('Hosting')
    .description('Delete a hosting')
    .option('-h, --help <topic>', 'Hosting name')
    .action(async (...options) => {
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()
      echo()
      new commands.HostingDelete(context).run(options)
    })

  program
    .command('list')
    .group('Hosting')
    .description('List hostings')
    .action(async (...options) => {
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()
      new commands.HostingList(context).run(options)
    })

  program
    .command('files <name>')
    .group('Hosting')
    .description('List hosting files')
    .action(async (...options) => {
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()
      echo()
      new commands.HostingFilesCmd(context).run(options)
    })

  program
    .command('sync <name>')
    .group('Hosting')
    .description('Publish your local hosting files')
    .option('-d, --no-delete', 'Update and add files only (do not delete files)')
    .option('-s, --socket <name>', 'socket')
    .action(async (...options) => {
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()
      echo()
      new commands.HostingSync(context).run(options)
    })

  program
    .command('config <name>')
    .group('Hosting')
    .description('Configure hosting parameters')
    .option('-c, --cname <domain_name>', 'add CNAME to hosting')
    .option('-d, --remove-cname <domain_name>', 'remove CNAME from hosting')
    .option('-b, --browser-router <true|false>', 'turn on/off the BrowserRouter support')
    .action(async (...options) => {
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()
      echo()
      new commands.HostingConfig(context).run(options)
    })

  program
    .on('*', (commandsArr) => validateCommands(commandsArr))

  if (!process.argv.slice(2).length) {
    program.outputHelp()
  }

  program.parse(process.argv)
}

setup()
