import format from 'chalk';
import inquirer from 'inquirer';

import {
  echo,
  echon,
  error,
  p,
  printCode,
  printSourceCode
} from '../utils/print-tools';

class SocketEndpointCall {
  constructor(context) {
    this.context = context;
    this.session = context.session;
    this.Socket = context.Socket;
  }

  static validateValue(value) {
    if (!value) {
      return 'We need this!';
    }

    return true;
  }

  static promptParamQuestion(params, param) {
    const description = params[param].description || '';
    const paramType = params[param].type;
    echo(4)(`- ${param} ${format.dim(`(${paramType})`)} ${description}`);
    const question = {
      name: param,
      message: p(2)(`Type in value for "${format.green(param)}" parameter`),
      default: params[param].example,
      validate: (value) => SocketEndpointCall.validateValue(value)
    };
    return question;
  }

  static listParams(endpointObj) {
    const params = endpointObj.metadata.parameters || {};
    const paramsCount = Object.keys(params).length;
    const questions = [];

    if (!paramsCount) return questions;

    echo();
    echon(4)(`You can pass ${format.cyan(paramsCount)} `);
    echo(`parameter(s) to ${format.cyan(endpointObj.getFullName())} endpoint:`);
    echo();

    Object.keys(params).forEach((param) => {
      questions.push(this.promptParamQuestion(params, param));
    });
    echo();

    return questions;
  }

  static formatResponse(res, bodyOnly) {
    // Callback for the HTTP request response
    const contentType = res.headers['content-type'];

    echo();
    if (!bodyOnly) {
      echo(4)(format.grey('statusCode:'), printCode(res.status));
      echo(4)(format.grey('content-type:'), res.headers['content-type']);
      echo(4)(format.grey('body:'));
    }

    echo();
    echo(p(bodyOnly ? 0 : 4)(printSourceCode(contentType, res.data)));
    echo();
  }

  async run([fullEndpointName, cmd]) {
    try {
      const bodyOnly = cmd.body;
      const socketName = fullEndpointName.split('/')[0];
      const endpointName = fullEndpointName.split('/')[1];
      const socket = await this.Socket.get(socketName);
      const endpointObj = await socket.getEndpoint(endpointName);

      if (endpointObj && endpointObj.existRemotely) {
        const askQuestions = SocketEndpointCall.listParams(endpointObj);
        const resp = await inquirer.prompt(askQuestions) || {};

        endpointObj.call(resp)
          .then((res) => SocketEndpointCall.formatResponse(res, bodyOnly))
          .catch((err) => {
            if (err.response) {
              SocketEndpointCall.formatResponse(err.response);
            } else {
              error(err);
            }
          });
      } else {
        error('No such endpoint on the server! Make sure you have synced your socket.');
      }
    } catch (err) {
      error(err);
    }
  }
}

export default SocketEndpointCall;
