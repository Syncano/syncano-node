import logger from '../debug';
import { warning } from '../print-tools';


const { debug } = logger('utils-plugins');

export default class Plugins {
  constructor(session) {
    this.session = session;
    this.plugins = session.settings.project.getPlugins() || [];
  }

  load(program) {
    debug('load()');
    Object.keys(this.plugins).forEach((pluginName) => {
      /* eslint-disable import/no-dynamic-require */
      /* eslint-disable global-require */
      debug('loading plugin:', pluginName);
      try {
        const PluginImport = require(this.plugins[pluginName]).default;
        program
          .command(pluginName)
          .description(pluginName)
          .action((...options) => {
            new PluginImport().run({ session: this.session, options });
          });
      } catch (err) {
        warning('Error while loading plugin:', this.plugins[pluginName]);
      }
    });
  }
}
