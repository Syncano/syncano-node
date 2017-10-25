import fs from 'fs-extra';
import mkdirp from 'mkdirp';
import child from 'child_process';
import YAML from 'js-yaml';
import path from 'path';
import Promise from 'bluebird';

import logger from '../debug';
import session from '../session';
import { builtInTemplates } from '../../constants/Constants';


const { debug } = logger('utils-sockets-utils');

const socketTemplates = () => {
  const installedTemplates = session.settings.project.getSocketTemplates();
  const installedTemplatesList = Object.keys(installedTemplates)
    .map((templateName) => {
      const temp = { name: templateName, description: '' };
      return temp;
    });
  return builtInTemplates.concat(installedTemplatesList);
};

const getTemplatesChoices = () => socketTemplates().map((socketTemplate) =>
    `${socketTemplate.name} - ${socketTemplate.description}`);

const searchForSockets = (projectPath) => {
  const sockets = [];

  const dirs = (p) => fs.readdirSync(p).filter((f) => fs.statSync(path.join(p, f)).isDirectory())

  dirs(projectPath).forEach((dir) => {
    const socketFile = path.join(projectPath, dir, 'socket.yml')
    if (fs.existsSync(socketFile)) {
      const socket = YAML.load(fs.readFileSync(socketFile, 'utf8')) || {};
      sockets.push([socketFile, socket])
    }
  })

  return sockets;
}

const findLocalPath = (socketName) => {
  debug('findLocalPath');
  let socketPath = null;
  const projectPath = session.projectPath || process.cwd();

  if (!fs.existsSync(projectPath)) {
    return socketPath;
  }

  const socketInCurrentPath = path.join(projectPath, 'socket.yml');
  if (fs.existsSync(socketInCurrentPath)) {
    const socket = YAML.load(fs.readFileSync(socketInCurrentPath, 'utf8')) || {};
    if (socket.name === socketName) {
      return path.dirname(socketInCurrentPath);
    }
  }

  searchForSockets(projectPath).forEach(([file, socket]) => {
    if (socket.name === socketName) {
      socketPath = path.dirname(file);
    }
  });

  return socketPath;
};

// Listing sockets
// list sockets based on project path
const listLocal = () => {
  debug('listLocal');
  return searchForSockets(session.projectPath).map(([file, socket]) => socket.name)
};

const getOrigFilePath = (origFileLine) => {
  let origFilePath = origFileLine.source.match(/webpack:\/\/\/(.*\.js)(\?|$)/)[1];

  if (origFilePath.match(/~\//)) {
    origFilePath = origFilePath.replace('~', 'node_modules');
  }
  return origFilePath;
};

const updateSocketNPMDeps = (folder) => {
  debug('updateSocketDeps');
  return new Promise((resolve, reject) => {
    const prodFolder = path.join(folder, '.dist');
    debug('prodFolder', prodFolder);
    if (!fs.existsSync(prodFolder)) {
      mkdirp.sync(prodFolder);
    }

    fs.copySync(path.join(folder, 'package.json'), path.join(prodFolder, 'package.json'));

    child.exec('yarn --production', { cwd: prodFolder }, (yarnErr, stdout, stderr) => {
      // TODO: work a little bit more with results
      if (yarnErr) {
        return reject(yarnErr);
      }
      return resolve({ stdout, stderr });
    });
  });
};

export default {
  getTemplatesChoices,
  findLocalPath,
  listLocal,
  getOrigFilePath,
  updateSocketNPMDeps
};
