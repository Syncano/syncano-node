import fs from 'fs';
import format from 'chalk';
import path from 'path';
import prettyBytes from 'pretty-bytes';
import _ from 'lodash';
import Promise from 'bluebird';
import md5 from 'md5';
import axios from 'axios';

import session from '../session';
import logger from '../debug';
import { getFiles } from './utils';
import { echo, error } from '../../utils/print-tools';


const { debug } = logger('utils-hosting');

class HostingFile {
  loadRemote(fileRemoteData) {
    this.id = fileRemoteData.id;
    this.instanceName = fileRemoteData.instanceName;
    this.path = fileRemoteData.path;
    this.checksum = fileRemoteData.checksum;
    this.size = fileRemoteData.size;
    return this;
  }
  loadLocal(fileLocalData) {
    this.localPath = fileLocalData.path;
    this.path = path.basename(this.localPath);
    this.checksum = md5(fs.readFileSync(this.localPath));
    this.size = fs.statSync(this.localPath).size;
    return this;
  }
}

class Hosting {
  constructor(hostingName, socket) {
    debug('Hosting.constructor', hostingName, socket);

    this.name = hostingName;
    this.socket = socket || null;
    this.path = null;

    this.existRemotely = null;
    this.existLocally = null;

    this.hostingURL = `/v2/instances/${session.project.instance}/hosting/`;
    this.editHostingURL = `https://${session.getHost()}${this.hostingURL}${this.name}/`;
    this.hostingHost = session.getHost() === 'api.syncano.rocks' ? 'syncano.ninja' : 'syncano.site';

    this.loadLocal();
  }

  static add(params) {
    const configParams = {
      src: params.src
    };
    session.settings.project.addHosting(params.name, configParams);

    const hostingURL = `/v2/instances/${session.project.instance}/hosting/`;
    const addHostingURL = `https://${session.getHost()}${hostingURL}`;

    const domains = [params.name];
    if (params.cname) {
      domains.push(params.cname);
    }

    const paramsToAdd = {
      name: params.name,
      domains
    };

    return axios.request({
      url: addHostingURL,
      method: 'POST',
      data: paramsToAdd,
      headers: {
        'X-Api-Key': session.settings.account.getAuthKey()
      }
    })
    .then((response) => response.data);
  }

  hasCNAME(cname) {
    return this.domains.indexOf(cname) > -1;
  }

  configure(params) {
    const domains = this.domains;
    if (params.cname && this.domains.indexOf(params.cname) < 0) {
      domains.push(params.cname);
    }

    if (params.removeCNAME) {
      const cnameToRemoveIndex = domains.indexOf(params.removeCNAME);
      if (cnameToRemoveIndex > -1) {
        domains.splice(cnameToRemoveIndex, 1)
      }
    }

    const paramsToUpdate = {
      name: this.name,
      domains
    };

    return axios.request({
      url: this.editHostingURL,
      method: 'PATCH',
      data: paramsToUpdate,
      headers: {
        'X-Api-Key': session.settings.account.getAuthKey()
      }
    })
    .then((response) => {
      const hosting = response.data;
      return this.setRemoteState(hosting);
    });
  }

  deploy() {
    debug('deploy');

    if (!this.existRemotely) {
      debug('adding hosting');
      return Hosting.add({
        name: this.name,
        src: this.src
      });
    }

    debug('patching hosting');
    // TODO: not optimal
    const paramsToUpdate = {
      name: this.name,
      domains: this.domains
    };

    return axios.request({
      url: this.editHostingURL,
      method: 'PATCH',
      data: paramsToUpdate,
      headers: {
        'X-Api-Key': session.settings.account.getAuthKey()
      }
    })
    .then((response) => {
      const hosting = response.data;
      return this.setRemoteState(hosting);
    })
    .catch((err) => {
      console.log(err);
    });
  }

  delete() {
    if (!this.socket) {
      return axios.request({
        url: this.editHostingURL,
        method: 'DELETE',
        headers: {
          'X-Api-Key': session.settings.account.getAuthKey()
        }
      })
      .then(() => {
        session.settings.project.deleteHosting(this.name);
        return this;
      });
    }
  }

  static get(hostingName, socket) {
    debug(`get ${hostingName}`);
    const hosting = new Hosting(hostingName, socket);
    return hosting.loadRemote();
  }

  static listLocal(socket) {
    return socket.settings.listHosting();
  }

  static listFromProject() {
    return session.settings.project.listHosting();
  }

  // list all hostings (mix of locally definde and installed on server)
  static async list(socket) {
    debug('list()');
    // const localHostings = Hosting.listLocal(socket);
    if (!socket) {
      const projectHostings = Hosting.listFromProject();
      debug('projectHostings', projectHostings);
      const promises = projectHostings.map((hosting) => Hosting.get(hosting.name));
      return Promise.all(promises);
    }
  }

  static getDirectories() {
    const excluded = ['node_modules', 'src', 'syncano'];

    function notExcluded(dirname) {
      if (dirname.startsWith('.')) {
        return;
      }
      if (excluded.indexOf(dirname) !== -1) {
        return;
      }
      return dirname;
    }

    return fs.readdirSync(process.cwd()).filter((file) => {
      const dirs = [];
      if (fs.statSync(`${process.cwd()}/${file}`).isDirectory()) {
        dirs.push(file);
      }
      return dirs.find(notExcluded);
    });
  }

  async setRemoteState(hosting) {
    debug('setRemoteState', hosting.name);
    if (hosting && typeof hosting === 'object') {
      this.existRemotely = true;
      this.name = hosting.name;
      this.description = hosting.description;
      this.domains = hosting.domains;

      return this.areFilesUpToDate()
        .then((status) => {
          this.isUpToDate = status;
        });
    }
    this.existRemotely = false;
    this.error = hosting;
    return Promise.resolve();
  }

  loadRemote() {
    debug('loadRemote()');
    return this.getRemote()
      .then(async (hosting) => this.setRemoteState(hosting))
      .then(() => this)
      .catch((err) => {
        this.existRemotely = false;
        return this;
      });
  }

  loadLocal() {
    debug('loadLocal()');
    let localHostingSettings = {};
    if (this.socket) {
      if (this.socket.settings.loaded) {
        localHostingSettings = this.socket.settings.getHosting(this.name);
      }
    } else {
      localHostingSettings = session.settings.project.getHosting(this.name);
    }

    if (!localHostingSettings) {
      return;
    }

    if (Object.keys(localHostingSettings).length > 0) {
      this.existLocally = true;
      this.src = localHostingSettings.src;
      this.cname = localHostingSettings.cname;
      this.path = path.join(session.projectPath, this.src, '/');
      this.url = this.getURL(this.name);
    }
  }

  getURL() {
    return `https://${this.name}--${session.project.instance}.${this.hostingHost}`;
  }

  getLocalFilePath(file) {
    debug('getLocalFilePath');
    if (!file) return null;
    return file.localPath.replace(this.path, '');
  }

  // Verify local file if it should be created or updated
  getFilesToUpload(file, remoteFiles) {
    debug('getFilesToUpload');
    const localHostingFilePath = this.getLocalFilePath(file);
    const fileToUpdate = _.find(remoteFiles, { path: localHostingFilePath });
    const payload = { file: session.connection.file(file.localPath), path: localHostingFilePath };
    const uploads = [];

    if (fileToUpdate) {
      const remoteChecksum = fileToUpdate.checksum;
      const localChecksum = file.checksum;

      // Check if checksum of the local file is the same as remote one
      if (remoteChecksum === localChecksum) {
        return session.connection.HostingFile.please().get({ id: fileToUpdate.id, hostingId: this.name })
        .then((singleFile) => {
          echo(6)(`${format.green('✓')} File skipped: ${format.dim(localHostingFilePath)}`);
          return singleFile;
        })
        .catch((err) => error(err));
      }
      uploads.push(session.connection
        .HostingFile
        .please()
        .update({ id: fileToUpdate.id, hostingId: this.name }, payload)
        .then((singleFile) => {
          echo(6)(`${format.green('✓')} File updated: ${format.dim(localHostingFilePath)}`);
          return singleFile;
        })
        .catch((err) => {
          echo(`Error while syncing (updating) ${localHostingFilePath}`);
        }),
      );
    } else {
      // Adding (first upload) file
      uploads.push(session.connection
        .HostingFile
        .please()
        .upload({ hostingId: this.name }, payload)
        .then((singleFile) => {
          echo(6)(`${format.green('✓')} File added:   ${format.dim(localHostingFilePath)}`);
          return singleFile;
        })
        .catch((err) => {
          echo(`Error while syncing (creating) ${file.path}`);
        }),
      );
    }

    return uploads;
  }

  // Files upload report
  generateUploadFilesResult(result) {
    if (!result) {
      return `\n\t${format.red('No files synchronized!')}\n`;
    }
    const prettyUploadSize = prettyBytes(result.uploadedSize);

    return `\n\t${format.cyan(result.uploadedFilesCount)} files synchronized, ${format.cyan(prettyUploadSize)} in total
    \t${format.green(this.name)} is available at: ${format.green(this.getURL())}\n`;
  }

  async uploadFiles(files) {
    let uploadedFilesCount = 0;
    let uploadedSize = 0;
    const promises = [];

    const localFiles = await this.listLocalFiles();

    localFiles.map((file) => promises.push(
      this.getFilesToUpload(file, files)
    ));

    return Promise.all(_.flattenDeep(promises)).then((values) => {
      uploadedFilesCount = 0;
      uploadedSize = 0;
      values.forEach((upload) => {
        uploadedFilesCount += 1;
        uploadedSize += upload.size;
      });
      return Promise.resolve({ uploadedFilesCount, uploadedSize });
    });
  }

  // Run this to synchronize hosted files
  // first we are getting remote files
  async syncFiles() {
    debug('syncFiles()');

    if (!fs.existsSync(this.path)) {
      throw new Error(`Local folder ${format.bold(this.path)} doesn't exist!`);
    }

    const remoteFiles = await this.listRemoteFiles();
    const result = await this.uploadFiles(remoteFiles);
    const output = this.generateUploadFilesResult(result);

    return output;
  }

  async areFilesUpToDate() {
    debug('areFilesUpToDate()');

    // Check if local folder exist
    if (!fs.existsSync(this.path)) {
      return false;
    }

    const localChecksums = await this.listLocalFiles().map((localFile) => ({
      filePath: this.getLocalFilePath(localFile),
      checksum: localFile.checksum
    }));

    const remoteChecksums = await this.listRemoteFiles().map((remoteFile) => ({
      filePath: remoteFile.path,
      checksum: remoteFile.checksum
    }));

    return _.isEqual(_.sortBy(localChecksums, 'filePath'), _.sortBy(remoteChecksums, 'filePath'));
  }

  // Get list of the hostings first, then get the files list for given one
  async listRemoteFiles() {
    debug('listRemoteFiles()');
    const files = session.connection.HostingFile.please().all({ hostingId: this.name });
    return new Promise((resolve, reject) => {
      files.on('stop', (fetchedFiles) => resolve(fetchedFiles.map((file) => new HostingFile().loadRemote(file))));
    });
  }

  // Get info about hostings first, then get the files list for given one
  async listLocalFiles() {
    debug('listLocalFiles');
    const localHostingFiles = this.path ? await getFiles(this.path) : [];
    if (!Array.isArray(localHostingFiles)) return localHostingFiles;

    return localHostingFiles ? localHostingFiles.map((file) => new HostingFile().loadLocal({ path: file })) : [];
  }

  async listFiles() {
    const remoteFiles = await this.listRemoteFiles();
    const listLocalFiles = await this.listLocalFiles();

    const files = [];
    listLocalFiles.forEach((localFile) => {
      const file = localFile;
      const remoteCopy = _.find(remoteFiles, { path: this.getLocalFilePath(file) });

      if (remoteCopy) {
        file.isUpToDate = file.checksum === remoteCopy.checksum;
        file.isSynced = true;
        _.extend(file, remoteCopy);
      }
      files.push(file);
    });
    return files;
  }

  getCnameURL() {
    const cname = _.find(this.domains, (domain) => domain.indexOf('.') !== -1);
    if (cname) {
      return `http://${cname}`;
    }
  }

  // TODO: filtering hostings (wating for core)
  static async listRemote(socket) {
    debug('listRemote');
    const hostings = await session.connection
      .Hosting
      .please()
      .list();
    return hostings.map((hosting) => new Hosting(hosting.name, socket));
  }

  getRemote() {
    debug('getRemote()', this);
    return session.connection
      .Hosting
      .please()
      .get({ id: this.name })
      .then((res) => res);
  }
}

export { Hosting as default, HostingFile };
