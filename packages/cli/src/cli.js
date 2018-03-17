#!/usr/bin/env node
import _ from 'lodash'
import Command from 'commander'
import program from './program'
import commands from './commands'
import context from './utils/context'
import validateCommands from './utils/validate-commands'
import initRaven from './utils/raven'
import session from './utils/session'
import logger from './utils/debug'
import pjson from '../package.json'
import { echo } from './utils/print-tools'

const { debug } = logger('main-cli')
initRaven()

const commandDebug = (options) => {
  const cmd = _.find(options, (option) => option instanceof Command.Command)
  debug(`Command: ${cmd.parent.rawArgs.slice(2).join(' ')}`)
}

const trackAndDebug = (options, additionalParams) => {
  commandDebug(options)
}

const setup = async () => {
  debug(pjson.version)
  await context.session.load()

  program
    .version(pjson.version)

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
    .action(async (...options) => {
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
    .action((...options) => {
      trackAndDebug(options)
      new commands.Login(context).run(options)
    })

  program
    .command('logout')
    .group('Basics')
    .description('Logout from your current account')
    .action((...options) => {
      trackAndDebug(options)
      new commands.Logout(context).run(options)
    })

  program
    .command('hot [socket_name]')
    .group('Project')
    .description('Hot deploy to make your project continuously synced to the Syncano cloud')
    .action(async (...options) => {
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
    .option('-i, --create-instance <instance>', 'Create instance if it doesn\'t exist')
    .option('-t, --trace', 'Turn on showing traces')
    .action(async (...options) => {
      trackAndDebug(options)
      session.isAuthenticated()
      session.hasProjectPath()
      await session.checkConnection()
      echo()
      new commands.SocketDeploy(context).run(options)
    })

  program
    .command('call <socket_name>/<endpoint>')
    .group('Project')
    .description("Call Socket's endpoint")
    .option('-b, --body', 'Print only body of the response')
    .action(async (...options) => {
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
    .option('-d, --with-deps', 'Print also Sockets which are dependencies of other Sockets')
    .action(async (...options) => {
      trackAndDebug(options)
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()
      new commands.SocketList(context).run(options)
    })

  program
    .command('add <socket_name>')
    .group('Sockets')
    .description('Add a Socket as a dependency of your project or local Socket')
    .option('-s, --socket <socket>', 'Name of the Socket')
    .action(async (...options) => {
      const [name] = options
      trackAndDebug(options, { socketName: name })
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()
      echo()
      new commands.SocketAdd(context).run(options)
    })

  program
    .command('remove <socket_name>')
    .group('Sockets')
    .description('Remove a Socket from your project')
    .action(async (...options) => {
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
    .action((...options) => {
      const [name] = options
      trackAndDebug(options, { socketName: name })
      session.hasProject()
      new commands.SocketCreate(context).run(options)
    })

  program
    .command('config <socket_name>')
    .group('Sockets')
    .description('Configure a given Socket')
    .action(async (...options) => {
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
    .action(async (...options) => {
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
    .action(async (...options) => {
      trackAndDebug(options)
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()
      echo()
      new commands.SocketConfigShow(context).run(options)
    })

  program
    .command('search [keyword]')
    .group('Registry')
    .description('Search for a specific Socket in the Sockets Registry')
    .option('-l, --long', 'Display full descriptions')
    .action((...options) => {
      const [keyword] = options
      trackAndDebug(options, { keyword })
      if (!keyword) {
        return program.outputHelp()
      }
      echo()
      new commands.SocketSearch(context).run(options)
    })

  program
    .command('submit <socket_name>')
    .group('Registry')
    .description('Submit a Socket to Socket Registry')
    .option(
      '-b, --bump <release type>',
      'Bump version of the socket (major, premajor, minor, preminor, patch, prepatch, or prerelease)'
    )
    .action(async(...options) => {
      const [name] = options
      trackAndDebug(options, { socketName: name })
      new commands.SocketSubmit(context).run(options)
    })

  program
    .command('publish <socket_name>')
    .group('Registry')
    .description('Publish a Socket in a Socket Registry')
    .option(
      '-v, --version <socket version>',
      'Version of the Socket you want to publish'
    )
    .action(async(...options) => {
      const [name] = options
      trackAndDebug(options, { socketName: name })
      new commands.SocketPublish(context).run(options)
    })

  program
    .command('trace [socket_name]')
    .group('Project')
    .description('Trace Socket calls')
    .action(async (...options) => {
      trackAndDebug(options)
      session.isAuthenticated()
      session.hasProject()
      await session.checkConnection()
      echo()
      new commands.SocketTrace(context).run(options)
    })

  program
    .command('hosting', 'Manage your web assets and host them on Syncano')
    .on('*', (commandsArr) => validateCommands(commandsArr))

  program
    .command('component', 'Manage your Socket components')
    .on('*', (commandsArr) => validateCommands(commandsArr))

  program
    .command('instance', 'Manage your instances')
    .on('*', (commandsArr) => validateCommands(commandsArr))

  context.session.loadPlugins(program, context)
  program.parse(process.argv)

  if (!process.argv.slice(2).length) {
    program.outputHelp()
  }
}

setup()
