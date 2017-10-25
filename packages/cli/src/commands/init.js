import format from 'chalk';
import inquirer from 'inquirer';

import logger from '../utils/debug';
import { p, echo } from '../utils/print-tools';
import Login from './login';


const { debug } = logger('cmd-init');

class InitCmd {
  constructor(context) {
    debug('InitCmd.constructor');
    this.context = context;
    this.session = context.session;
    this.Init = context.Init;
  }

  async run([cmd]) {
    if (!this.session.settings.account.authenticated()) {
      echo();
      echo(4)(format.red('You have to be logged in to initialize a new project!'));
      await new Login(this.context).run([]);
    }

    this.init = new this.Init();

    const { project } = this.session;
    const { instance } = cmd;

    const questions = [
      {
        name: 'Template',
        type: 'list',
        message: p(2)('Choose template for your project'),
        choices: this.init.getTemplatesChoices().map((choice) => p(4)(choice)),
        default: 1
      }
    ];

    if (!project) {
      echo();
      echo(4)(format.cyan('New project? Exciting! 🎉'));
      echo();
    } else {
      echo();
      echo(4)('I found the Syncano instance for the project in this folder,');
      echo(4)("but you don't have any config files - I'll create them for you!");
      echo();
    }

    inquirer.prompt(questions)
      .then(async (promptResponses) => {
        this.init.templateName = promptResponses.Template
          .split(' - ')[0] // find name
          .replace(/ /g, ''); // strip padding

        if (!project && instance) {
          await this.session.checkConnection(instance);
          this.init.addConfigFiles({ instance });
          return this.init.createFilesAndFolders();
        }

        if (!project && !instance) {
          return this.session.createInstance()
            .then((newInstance) => {
              this.init.addConfigFiles({ instance: newInstance.name });
              this.init.createFilesAndFolders();
              return this.session.load();
            });
        }

        if (this.init.checkConfigFiles()) {
          return this.init.noConfigFiles();
        }
      });
  }
}

export default InitCmd;
