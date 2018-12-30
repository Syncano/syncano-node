import path from 'path'
import logger from '../debug'
import { warning } from '../print-tools'
import {
  CLISession,
  CLIPlugin,
  CLIProgramContext
} from '../../types'

const { debug } = logger('utils-plugins')

export default class Plugins {
  session: CLISession
  plugins: CLIPlugin[]
  constructor (session: CLISession) {
    this.session = session
    this.plugins = session.settings.project.getPlugins() || []
  }

  load (program, context: CLIProgramContext) {
    debug('load()')
    Object.keys(this.plugins).forEach((pluginName) => {
      /* eslint-disable import/no-dynamic-require */
      /* eslint-disable global-require */
      debug('loading plugin:', pluginName)

      // Add directory where CLI command is executed
      module.paths.push(path.join(process.cwd(), 'node_modules'))
      try {
        const PluginImport = require(this.plugins[pluginName]).default
        program
          .command(pluginName)
          .description(`${pluginName} plugin`)
          .action((...options) => {
            new PluginImport(context).run(options)
          })
      } catch (err) {
        console.log(err)
        warning('Error while loading plugin:', this.plugins[pluginName])
      }
    })
  }
}
