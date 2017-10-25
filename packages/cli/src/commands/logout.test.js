import sinon from 'sinon';
import format from 'chalk';
import Logout from './logout';
import context from '../utils/context';
import session from '../utils/session';
import printTools from '../utils/print-tools';

describe('[commands] Logout', function() {
  const logout = new Logout(context);
  let account = null;
  let interEcho = null;
  let echo = null;
  logout.session.load()
  .then(() => {
    account = logout.session.settings.account;
  })
  .catch((err) => {
    account = logout.session.settings.account;
  });

  beforeEach(function() {
    interEcho = sinon.stub();
    echo = sinon.stub(printTools, 'echo', (content) => interEcho);
  });

  afterEach(function() {
    interEcho.reset();
    printTools.echo.restore();
  });

  describe.skip('run command', function() {
    it('should call a logout user method', sinon.test(function() {
      const logoutUser = this.stub(session.settings.account, 'logout');
      this.stub(account, 'authenticated').returns(true);

      logout.run([]);

      sinon.assert.called(logoutUser);
    }));

    it('should print message with proper padding after logout a user', sinon.test(function() {
      this.stub(session.settings.account, 'logout');
      this.stub(account, 'authenticated').returns(true);

      logout.run([]);

      sinon.assert.calledWith(echo, 4);
      sinon.assert.calledWith(interEcho, `${format.green('You have been logged out!')}`);
    }));

    before(function() {
      sinon.stub(process, 'exit');
    });

    after(function() {
      process.exit.restore();
    });

    it('should print message if user is not logged in', sinon.test(function() {
      this.stub(account, 'authenticated').returns(false);

      logout.run([]);

      sinon.assert.calledWith(echo, 4);
      sinon.assert.calledWith(interEcho, `${format.red('You are not logged in!')}`);
    }));
  });
});
