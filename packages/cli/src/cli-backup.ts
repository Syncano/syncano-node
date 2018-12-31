#!/usr/bin/env node
import program from './program'
import commands from './commands'
import session from './utils/session'
import context from './utils/context'
import { echo } from './utils/print-tools'

const setup = async () => {
  await context.session.load()

  program
    .command('create')
    .group('Backup')
    .description('Create backup')
    .action(async (...options: any[]) => {
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()
      echo()
      new commands.BackupsCreate(context).run(options)
    })

  program
    .command('list')
    .group('Backup')
    .description('List backups')
    .action(async (...options) => {
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()
      echo()
      new commands.BackupsList(context).run(options)
    })

  program
    .command('last')
    .group('Backup')
    .description('Last backup')
    .action(async (...options) => {
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()
      echo()
      new commands.BackupsLast(context).run(options)
    })

  program
    .command('delete <id>')
    .group('Backup')
    .option('all', 'Delete all backups')
    .description('Delete backup')
    .action(async (...options) => {
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()
      echo()
      new commands.BackupsDelete(context).run(options)
    })

  if (!process.argv.slice(2).length) {
    program.outputHelp()
  }

  program.parse(process.argv)
}

setup()
