import format from 'chalk';

import { p, echo, error } from '../../utils/print-tools';
import { currentTime } from '../../utils/date-utils';


function printCompileError(errObj, socketName) {
  if (errObj.errorType === 'compilationError') {
    if (socketName) {
      echo(7)(`${format.red('deploy error:')} ${currentTime()} ${format.cyan(socketName)} socket`);
    }
    echo();
    error(14)(`${errObj.error.message}`);
    echo();
    echo(14)(`${errObj.error.codeFrame.split('\n').join(`\n${p(14)()}`)}`);
    echo();
  }
}

export default {
  printCompileError
};
