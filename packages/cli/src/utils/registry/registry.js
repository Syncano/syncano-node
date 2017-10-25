import fs from 'fs';
import path from 'path';
import axios from 'axios';
import https from 'https';
import FormData from 'form-data';

import logger from '../debug';
import session from '../session';

const REGISTRY_TIMEOUT = 60000;

const { debug } = logger('utils-registry');

class Registry {
  constructor() {
    debug('Registry.constructor');

    const registryInstance = process.env.SYNCANO_SOCKET_REGISTRY_INSTANCE || 'socket-registry';
    this.registryHost = `${registryInstance}.${session.ENDPOINT_HOST}`;
    this.registryHostUrl = `https://${this.registryHost}`;

    this.fileStorageHost = session.getHost();
    this.fileStorageEndpoint = `/v2/instances/${registryInstance}/classes/storage/objects/`;

    if (session.project) {
      this.installEndpoint = `/v2/instances/${session.project.instance}/sockets/install/`;
      this.installUrl = `https://${session.getHost()}${this.installEndpoint}`;
    }
  }

  getFullSocket(name, version) {
    return this.searchSocketByName(name, version);
      // .then((socket) => { Registry.getSocket(socket) });
  }

  searchSocketByName(name, version) {
    debug(`searchSocketByName: ${name} (${version})`);
    return axios.request({
      url: `https://${this.registryHost}/registry/get/`,
      method: 'POST',
      timeout: REGISTRY_TIMEOUT,
      data: {
        name,
        version
      },
      headers: {
        'X-Syncano-Account-Key': session.settings.account.getAuthKey()
      }
    })
    .then((response) => response.data);
  }

  static getSocket(socket) {
    debug('getSocket');

    const fileName = path.join(session.getBuildPath(), `${socket.name}.zip`);
    const file = fs.createWriteStream(fileName);
    return new Promise((resolve, reject) => {
      https.get(socket.url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          debug('Socket zip downlaoded');
          file.close(resolve);
        });
      });
    });
  }

  publishSocket(socketName, version) {
    debug('publishSocket', socketName);
    return axios.request({
      url: `${this.registryHostUrl}/registry/publish/`,
      method: 'POST',
      timeout: REGISTRY_TIMEOUT,
      data: {
        name: socketName,
        version
      },
      headers: {
        'X-Syncano-Account-Key': session.settings.account.getAuthKey()
      }
    })
    .then((response) => response.data);
  }

  searchSocketsByAll(keyword) {
    return axios.request({
      url: `${this.registryHostUrl}/registry/search/`,
      method: 'POST',
      timeout: REGISTRY_TIMEOUT,
      data: { keyword },
      headers: {
        'X-Syncano-Account-Key': session.settings.account.getAuthKey()
      }
    })
    .then((response) => response.data);
  }

  submitSocket(socket) {
    return socket.createPackageZip()
      .then(() => axios.request({
        url: `${this.registryHostUrl}/registry/upload/`,
        method: 'POST',
        timeout: REGISTRY_TIMEOUT,
        headers: {
          'X-Syncano-Account-Key': session.settings.account.getAuthKey()
        }
      })
        .then((response) => response.data.url))
      .then((url) => new Promise((resolve, reject) => {
        debug('Socket compiled');
        const form = new FormData();
        form.append('file', fs.createReadStream(socket.getSocketZip()));

        form.submit({
          method: 'PATCH',
          protocol: 'https:',
          host: session.getHost(),
          path: url
        }, (err, res) => {
          if (err) {
            debug('Error while uploading file');
            reject(err);
          }
          res.on('data', (data) => {
            debug('Upload done');
            resolve(data);
          });
        });
      }))
      .then((resp) => {
        debug('File sent compiled', resp.status);
        const fileObj = JSON.parse(resp);
        return axios.request({
          url: `${this.registryHostUrl}/registry/add/`,
          method: 'POST',
          timeout: REGISTRY_TIMEOUT,
          data: {
            name: socket.spec.name,
            description: socket.spec.description,
            version: socket.spec.version,
            keywords: socket.spec.keywords,
            url: fileObj.file.value,
            config: socket.getFullConfig()
          },
          headers: {
            'X-Syncano-Account-Key': session.settings.account.getAuthKey()
          }
        });
      });
  }
}

export default Registry;
