import format from 'chalk';

import logger from '../utils/debug';
import { echo, error } from '../utils/print-tools';
import Hosting from '../utils/hosting';


const { debug } = logger('cmd-hosting-sync');

class HostingSync {
  constructor(context) {
    debug('HostingSync.constructor');
    this.context = context;
    this.session = context.session;
    this.Socket = context.Socket;
  }

  async run([hostingName, cmd]) {
    debug(`HostingSync.run ${hostingName}`);
    this.name = hostingName;
    if (!hostingName || typeof hostingName !== 'string') return error('Hosting name is a required parameter!');

    let hosting = null;
    if (cmd.socket) {
      this.socket = await this.Socket.get(cmd.socket);
    } else {
      hosting = await Hosting.get(hostingName, this.socket);
    }

    if (!hosting.existLocally) {
      if (this.socket) {
        error(4)(`There is no "${this.name}" hosting in the "${this.socket.name}" socket!`);
      } else {
        error(4)(`There is no "${this.name}" hosting in the project!`);
      }
      echo();
      process.exit();
    }

    return hosting.existRemotely && this.syncHosting(hosting);
  }

  async syncHosting(hosting) {
    debug(`Syncing ${hosting.name} (${this.session.project.instance})`);

    if (!hosting.name) return;
    echo(8)(`Syncing hosting files for ${format.cyan(hosting.name)}`);
    echo(8)(`${format.dim(hosting.getURL())}`);
    echo();

    return hosting.syncFiles()
      .then((output) => {
        echo(output);
      })
      .catch((err) => {
        error(8)(err);
        echo();
      });
  }
}

export default HostingSync;
