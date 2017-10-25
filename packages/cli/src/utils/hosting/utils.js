import Promise from 'bluebird';
import dir from 'node-dir';

const asyncDir = Promise.promisifyAll(dir);

function getFiles(directory) {
  return asyncDir.filesAsync(directory).catch((e) => e.code);
}

export default {
  getFiles,
  asyncDir
};
