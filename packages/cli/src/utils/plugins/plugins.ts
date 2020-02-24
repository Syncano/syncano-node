import path from 'path'

import {CLIPlugin} from '../../types'
import logger from '../debug'
import {warning} from '../print-tools'
import session from '../session'

const {debug} = logger('utils-plugins')

export default class Plugins {
  plugins: Record<string, string>

  constructor() {
    this.plugins = session.settings.project.getPlugins() || {}
  }

  load(program, context) {
    debug('load()')
    Object.keys(this.plugins).forEach(pluginName => {
      // eslint-disable import/no-dynamic-require
      // eslint-disable global-require
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
        // tslint:disable-next-line: no-console
        console.log(err)
        warning('Error while loading plugin:', this.plugins[pluginName])
      }
    })
  }
}
