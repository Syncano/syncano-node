#!/usr/bin/env node
import _ from 'lodash'
import Command, { CommandOptions, CommanderStatic } from 'commander'
import program from './program'
import commands from './commands'
import context from './utils/context'
import validateCommands from './utils/validate-commands'
import initRaven from './utils/raven'
import session from './utils/session'
import logger from './utils/debug'
import { echo } from './utils/print-tools'

const { debug } = logger('main-cli')
initRaven()

const commandDebug = (options) => {
  const cmd = _.find(options, (option) => option instanceof Command.Command)
  debug(`Command: ${cmd.parent.rawArgs.slice(2).join(' ')}`)
}

const trackAndDebug = (options, additionalParams?) => {
  commandDebug(options)
}

const setup = async () => {
  debug(session.CLIVersion)
  await context.session.load()

  program
    .version(session.CLIVersion)

  program
    .command('info')
    .group('Basics')
    .description('Info about current project/instance/user etc.')
    .action(async (...options: any[]) => {
      trackAndDebug(options)
      new commands.Info(context).run(options)
    })

  program
    .command('init')
    .group('Basics')
    .description('Start a Syncano project in the current directory')
    .option('-i, --instance <name>',
      'Instance you want to use for your project. If not provided, an Instance will be created')
    .action(async (...options) => {
      trackAndDebug(options)
      session.notAlreadyInitialized()
      new commands.Init(context).run(options)
    })

  program
    .command('attach')
    .group('Basics')
    .description('Attach project to the chosen Instance')
    .option('-i, --instance <name>', 'Instance you want to use for your project')
    .option('-c, --create-instance <name>', 'Create instance you want to use for your project')
    .action(async (...options: any[]) => {
      trackAndDebug(options)
      session.isAuthenticated()
      if (options[0].instance) {
        await session.checkConnection(options[0].instance)
      }
      session.hasProjectPath()
      echo()
      new commands.Attach(context).run(options)
    })

  program
    .command('login')
    .group('Basics')
    .description('Login to your account')
    .action((...options: any[]) => {
      trackAndDebug(options)
      new commands.Login(context).run(options)
    })

  program
    .command('logout')
    .group('Basics')
    .description('Logout from your current account')
    .action((...options: any[]) => {
      trackAndDebug(options)
      new commands.Logout(context).run(options)
    })

  program
    .command('sysinfo')
    .group('Basics')
    .description('Sys info for debug purpose')
    .action((...options: any[]) => {
      trackAndDebug(options)
      new commands.SysInfo(context).run(options)
    })

  program
    .command('hot [socket_name]')
    .group('Project')
    .description('Hot deploy to make your project continuously synced to the Syncano cloud')
    .action(async (...options: any[]) => {
      trackAndDebug(options)
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()

      const optionsToRun = options
      optionsToRun[1].trace = true
      echo()
      new commands.SocketDeployHot(context).run(optionsToRun)
    })

  program
    .command('deploy [socket_name]')
    .group('Project')
    .description('Synchronize your project to Syncano')
    .option('--hot', 'Enable Hot deploy')
    .option('-b, --bail', 'Bail after first deploy failure')
    .option('-p, --parallel', 'Run Socket deploys in parallel')
    .option('-i, --create-instance <instance>', 'Create instance if it doesn\'t exist')
    .option('-t, --trace', 'Turn on showing traces')
    .action(async (...options: any[]) => {
      trackAndDebug(options)
      session.isAuthenticated()
      session.hasProjectPath()
      await session.checkConnection()
      echo()
      new commands.SocketDeploy(context).run(options)
    })

  program
    .command('compile [socket_name]')
    .group('Project')
    .description('Compile Socket')
    .action(async (...options) => {
      trackAndDebug(options)
      echo()
      new commands.SocketCompile(context).run(options)
    })

  program
    .command('call <socket_name>/<endpoint>')
    .group('Project')
    .description("Call Socket's endpoint")
    .option('-b, --body', 'Print only body of the response')
    .action(async (...options: any[]) => {
      trackAndDebug(options)
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()
      new commands.SocketEndpointCall(context).run(options)
    })

  program
    .command('list [socket_name]')
    .group('Sockets')
    .description('List the installed Sockets')
    .option('-f, --full', 'Print the detailed information (including parameters and response)')
    .action(async (...options: any[]) => {
      trackAndDebug(options)
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()
      new commands.SocketList(context).run(options)
    })

  program
    .command('remove <socket_name>')
    .group('Sockets')
    .description('Remove a Socket from your project')
    .action(async (...options: any[]) => {
      const [name] = options
      trackAndDebug(options, { socketName: name })
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()
      echo()
      new commands.SocketUninstall(context).run(options)
    })

  program
    .command('create <socket_name>')
    .group('Sockets')
    .description('Create a new Socket for your project')
    .action((...options: any[]) => {
      const [name] = options
      trackAndDebug(options, { socketName: name })
      session.hasProject()
      new commands.SocketCreate(context).run(options)
    })


  program
    .command('config <socket_name>')
    .group('Sockets')
    .description('Configure a given Socket')
    .action(async (...options: any[]) => {
      const [name] = options
      trackAndDebug(options, { name })
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()
      new commands.SocketConfig(context).run(options)
    })

  program
    .command('config-set <socket_name> <option_name> <value>')
    .group('Sockets')
    .description('Configure a config option of a given Socket')
    .action(async (...options: any[]) => {
      trackAndDebug(options)
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()
      new commands.SocketConfigSet(context).run(options)
    })

  program
    .command('config-show <socket_name>')
    .group('Sockets')
    .description('Show config options of a Socket')
    .action(async (...options: any[]) => {
      trackAndDebug(options)
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()
      echo()
      new commands.SocketConfigShow(context).run(options)
    })

  program
    .command('trace [socket_name]')
    .group('Project')
    .description('Trace Socket calls')
    .action(async (...options: any[]) => {
      trackAndDebug(options)
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()
      echo()
      new commands.SocketTrace(context).run(options)
    })

  program
    .command('backup', 'Menage your backups')
    .on('*', (commandsArr) => validateCommands(commandsArr))

  program
    .command('hosting', 'Manage your web assets and host them on Syncano')
    .on('*', (commandsArr) => validateCommands(commandsArr))

  program
    .command('instance', 'Manage your instances')
    .on('*', (commandsArr) => validateCommands(commandsArr))

  context.session.loadPlugins(program, context as any)
  program.parse(process.argv)

  if (!process.argv.slice(2).length) {
    program.outputHelp()
  }
}

setup()
