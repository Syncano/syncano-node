import format from 'chalk';
import { error, echo } from '../utils/print-tools';

export default class SocketPublishCmd {
  constructor(context) {
    this.session = context.session;
    this.Socket = context.Socket;
  }

  async run([socketName, cmd]) {
    this.Socket.publish(socketName, cmd.version)
      .then((resp) => {
        echo();
        echo(4)(`Socket ${format.cyan(socketName)} is now publicly available!`);
        echo();
      })
      .catch((err) => {
        if (err.response && err.response.data) {
          echo();
          error(4)(err.response.data.message);
          echo();
        } else {
          echo();
          error(4)(err.message);
          echo();
        }
      });
  }
}
