import format from 'chalk';
import { echo } from '../utils/print-tools';

class Logout {
  constructor(context) {
    this.context = context;
    this.session = context.session;
  }

  run([cmd]) {
    const authenticated = this.session.settings.account.authenticated();

    if (!authenticated) {
      echo();
      echo(4)(`${format.red('You are not logged in!')}`);
      echo();
      return process.exit(1);
    }

    echo();
    echo(4)(`${format.green('You have been logged out!')}`);
    echo();

    this.session.settings.account.logout();
  }
}

export default Logout;
