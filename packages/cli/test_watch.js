import format from 'chalk';
import { error, echo, echon } from '../utils/print-tools';

const errorObj = { errorType: 'compilationError',
  error: {
    name: 'ModuleBuildError',
    message: 'Module build failed: SyntaxError: Unterminated string constant (4:55)\n\n\u001b[0m \u001b[90m 2 | \u001b[39m  setResponse(\u001b[36mnew\u001b[39m \u001b[33mHttpResponse\u001b[39m(\u001b[35m200\u001b[39m\u001b[33m,\u001b[39m \u001b[32m`Hello ${ARGS.firstname} ${ARGS.lastname}!`\u001b[39m\u001b[33m,\u001b[39m \u001b[32m\'text/plain\'\u001b[39m))\u001b[33m;\u001b[39m\n \u001b[90m 3 | \u001b[39m} \u001b[36melse\u001b[39m {\n\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 4 | \u001b[39m  setResponse(\u001b[36mnew\u001b[39m \u001b[33mHttpResponse\u001b[39m(\u001b[35m400\u001b[39m\u001b[33m,\u001b[39m \u001b[32m\'Hello stranger!\'\u001b[39m\u001b[33m,\u001b[39m \u001b[32m\'text/plain\u001b[39m\n \u001b[90m   | \u001b[39m                                                       \u001b[31m\u001b[1m^\u001b[22m\u001b[39m\n \u001b[90m 5 | \u001b[39m}\n \u001b[90m 6 | \u001b[39m\u001b[0m\n',
    details: 'Error',
    module: {
      resource: '/Users/adam/Syncano/foo/syncano/watwat/scripts/hello.js',
      buildTimestamp: 1487860999101
    },
    error:
    {
      name: 'BabelLoaderError',
      message: 'SyntaxError: Unterminated string constant (4:55)\n\n\u001b[0m \u001b[90m 2 | \u001b[39m  setResponse(\u001b[36mnew\u001b[39m \u001b[33mHttpResponse\u001b[39m(\u001b[35m200\u001b[39m\u001b[33m,\u001b[39m \u001b[32m`Hello ${ARGS.firstname} ${ARGS.lastname}!`\u001b[39m\u001b[33m,\u001b[39m \u001b[32m\'text/plain\'\u001b[39m))\u001b[33m;\u001b[39m\n \u001b[90m 3 | \u001b[39m} \u001b[36melse\u001b[39m {\n\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 4 | \u001b[39m  setResponse(\u001b[36mnew\u001b[39m \u001b[33mHttpResponse\u001b[39m(\u001b[35m400\u001b[39m\u001b[33m,\u001b[39m \u001b[32m\'Hello stranger!\'\u001b[39m\u001b[33m,\u001b[39m \u001b[32m\'text/plain\u001b[39m\n \u001b[90m   | \u001b[39m                                                       \u001b[31m\u001b[1m^\u001b[22m\u001b[39m\n \u001b[90m 5 | \u001b[39m}\n \u001b[90m 6 | \u001b[39m\u001b[0m\n',
      error: {} }
  }
};

const id = format.magenta('ID: 99');
const duration = format.dim('666 ms');
const remoteAddr = format.grey('(88.156.14.24)');
const requestMethod = format.grey('POST');
const exitCode = format.cyan(200);
const date = '10:55:37';
const dateRed = '10:55:37';
const fileChanged = `${format.cyan('scripts/hello.js')}`;
const traceback = errorObj.error.message.split('\n').splice(1);

echo(4)(format.green(date), format.red(`ERROR @ ${errorObj.error.module.resource}`));
echo();
echo(6)(errorObj.error.message.split('\n').join('\n    '));
// echon(Array(process.stdout.columns + 1).join('─'));
echo(4)(`${date} ${id} ${remoteAddr} - ${requestMethod} ${exitCode} hello/hello ${duration}`);
echo(4)(`${date} ${id} ${remoteAddr} - ${requestMethod} ${exitCode} hello/hello ${duration}`);
echo(4)(`${date} ${id} ${remoteAddr} - ${requestMethod} ${exitCode} hello/hello ${duration}`);
echo();
echo(6)(`Script body ${format.dim('(text/plain)')}:`);
echo();
echo(6)(format.dim('Hello Tyler Durden!'));
echo();
echo(4)(`${date} ${duration} ${id} ${remoteAddr} - ${requestMethod} ${exitCode} hello/hello ${duration}`);
echo();
echo(6)('Script stdout:');
echo();
echo(6)(format.dim('{"foo": "bar"}'));
echo();
echo(4)(`${date} ${duration} ${fileChanged} ${duration}`);
echo(4)(`${date} ${duration} Source files were changed and compiled ${duration}`);
echo(4)(`${date} ${duration} Socket's remote configuration updated ${duration}`);

echo();
echo(4)(format.green(date), format.red(`ERROR @ ${errorObj.error.module.resource}`));
echo();
echo(6)(errorObj.error.message.split('\n').join('\n    '));
echo(4)(`${date} ${id} ${remoteAddr} - ${requestMethod} ${exitCode} hello/hello ${duration}`);
echo(4)(`${date} ${id} ${remoteAddr} - ${requestMethod} ${exitCode} hello/hello ${duration}`);
echo(4)(`${date} ${id} ${remoteAddr} - ${requestMethod} ${exitCode} hello/hello ${duration}`);
echo();
echo(6)(`Script body ${format.dim('(text/plain)')}:`);
echo();
echo(6)(format.dim('Hello Tyler Durden!'));
echo();
echo(4)(`${date} ${id} ${remoteAddr} - ${requestMethod} ${exitCode} hello/hello ${duration}`);
echo();
echo(6)('Script stdout:');
echo();
echo(6)(format.dim('{"foo": "bar"}'));
echo();
echo(4)(`${date} ${fileChanged} ${duration}`);
echo(4)(`${date} Source files were changed and compiled ${duration}`);
echo(4)(`${date} Socket's remote configuration updated ${duration}`);
echo();


echo();
echo('SHORT MODE');
echo();

// echo();
// echo(4)(`${date} ${format.dim('file change')}: ${fileChanged} ${duration}`);
// echo(4)(`${date} ${format.dim('file compiled')}: ${fileChanged} ${duration}`);
// echo(4)(`${date} ${format.dim('file synced')}: ${fileChanged} ${duration}`);
// echo(4)(`${dateRed} ${format.dim('syntax error')}: ${fileChanged}`);
// echo(4)(`${date} ${format.dim('endpoint call')}: ${format.cyan('hello/hello')} ${requestMethod} ${exitCode} ${remoteAddr} ${duration}`);
// echo(4)(`${date} ${format.dim('file change')}: ${fileChanged} ${duration}`);
// echo(4)(`${date} ${format.dim('file compiled')}: ${fileChanged} ${duration}`);
// echo(4)(`${date} ${format.dim('file synced')}: ${fileChanged} ${duration}`);
// echo();

echo();
echo(2)(`${format.grey('  file change:')} ${date} ${fileChanged} ${duration}`);
echo(2)(`${format.grey('   file build:')} ${date} ${fileChanged} ${duration}`);
echo(2)(`${format.grey('    file sync:')} ${date} ${fileChanged} ${duration}`);
echo(2)(`${format.dim.red('  build error:')} ${dateRed} ${fileChanged} Module build failed: SyntaxError: Unterminated string constant (4:55)`);
echo(2)(`${format.grey('endpoint call:')} ${date} ${format.cyan('hello/hello')} ${requestMethod} ${exitCode} ${remoteAddr} ${duration}`);
echo(2)(`${format.dim.red('endpoint call:')} ${date} ${format.cyan('hello/hello')} ${requestMethod} ${'400'} ${remoteAddr} ${duration}`);
echo(2)(`${format.grey('  file change:')} ${date} ${fileChanged} ${duration}`);
echo(2)(`${format.grey('    file sync:')} ${date} ${fileChanged} ${duration}`);
echo();

echo();
echo(2)(`${format.grey('  file change:')} ${date} ${fileChanged} ${duration}`);
echo(2)(`${format.grey('   file build:')} ${date} ${fileChanged} ${duration}`);
echo(2)(`${format.grey('    file sync:')} ${date} ${fileChanged} ${duration}`);
echo(2)(`${format.dim.red('  build error:')} ${dateRed} ${fileChanged} Module build failed: SyntaxError: Unterminated string constant (4:55)`);
echo(15)(traceback.join('\n               '));
echo(2)(`${format.grey('endpoint call:')} ${date} ${format.cyan('hello/hello')} ${requestMethod} ${exitCode} ${remoteAddr} ${duration}`);
echo(2)(`${format.grey('response body:')} ${format.dim('(text/plain)')}`);
echo();
echo(17)(format.grey('Hello Tyler Durden!'));
echo();
echo(2)(`${format.dim.red('endpoint call:')} ${date} ${format.cyan('hello/hello')} ${requestMethod} ${'400'} ${remoteAddr} ${duration}`);
echo(2)(format.grey('script stdout:'));
echo(17)(format.grey('{"foo": "bar"}'));
echo();
echo(2)(`${format.grey('  file change:')} ${date} ${fileChanged} ${duration}`);
echo(2)(`${format.grey('    file sync:')} ${date} ${fileChanged} ${duration}`);
echo();
