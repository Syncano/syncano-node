import format from 'chalk';
import { echo, error } from '../utils/print-tools';


export default class SocketConfigShowCmd {
  constructor(context) {
    this.session = context.session;
    this.Socket = context.Socket;
  }

  async run([socketName, cmd]) {
    this.socket = await this.Socket.get(socketName);

    if (!this.socket.existRemotely) {
      error(4)('That socket was not synced!');
      echo();
      process.exit(1);
    }

    if (this.socket.spec.config) {
      Object.keys(this.socket.spec.config).forEach((optionName) => {
        const params = this.socket.spec.config[optionName];
        const required = params.required ? format.dim('(required)') : '';
        const currentValue = this.socket.remote.config[optionName];

        echo(format.dim('         name:'), `${format.bold(optionName)} ${required}`);
        echo(format.dim('  description:'), params.description);
        echo(format.dim('        value:'), currentValue);
        echo();
      });
    } else {
      echo(4)('This Socket doesn\'t have any config options.');
      echo();
      process.exit(0);
    }
  }
}
