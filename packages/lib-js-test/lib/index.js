'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateMeta = exports.run = undefined;

let verifyResponse = (() => {
  var _ref = _asyncToGenerator(function* (endpoint, responseType, response) {
    const validator = new _syncanoValidator2.default({
      meta: {
        metadata: socketDefinition.endpoints[endpoint]
      }
    });

    return validator.validateResponse(responseType, response);
  });

  return function verifyResponse(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

let verifyRequest = (() => {
  var _ref2 = _asyncToGenerator(function* (ctx) {
    const validator = new _syncanoValidator2.default(ctx);
    return validator.validateRequest(ctx);
  });

  return function verifyRequest(_x4) {
    return _ref2.apply(this, arguments);
  };
})();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _faker = require('faker');

var _faker2 = _interopRequireDefault(_faker);

var _lodash = require('lodash.merge');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _proxyquire = require('proxyquire');

var _proxyquire2 = _interopRequireDefault(_proxyquire);

var _syncanoValidator = require('syncano-validator');

var _syncanoValidator2 = _interopRequireDefault(_syncanoValidator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const socketFolder = process.cwd();
const socketScriptsFolder = _path2.default.join(socketFolder, 'src');
const compiledScriptsFolder = _path2.default.join(socketFolder, '.src');
const socketDefinition = _jsYaml2.default.load(_fs2.default.readFileSync('./socket.yml', 'utf8'));

const generateMeta = (endpointName, metaUpdate) => {
  const socketName = socketDefinition.name;

  const apiHost = process.env.SYNCANO_HOST;
  const token = process.env.SYNCANO_AUTH_KEY;
  const instance = process.env.SYNCANO_INSTANCE_NAME || process.env.SYNCANO_PROJECT_INSTANCE;

  let meta = {
    socket: socketName,
    api_host: apiHost,
    token,
    instance,
    debug: process.env.DEBUG || false,
    executor: `${socketName}/${endpointName}`,
    executed_by: 'socket_endpoint',
    request: {
      REQUEST_METHOD: 'POST',
      PATH_INFO: '/v2/instances/withered-voice-2245/endpoints/sockets/norwegian-postcode/search/',
      HTTP_USER_AGENT: _faker2.default.internet.userAgent(),
      HTTP_CONNECTION: 'close',
      REMOTE_ADDR: _faker2.default.internet.ip(),
      HTTP_HOST: apiHost,
      HTTP_UPGRADE_INSECURE_REQUESTS: '1',
      HTTP_ACCEPT: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      HTTP_ACCEPT_LANGUAGE: 'en,en-US;q=0.8,pl;q=0.6',
      HTTP_ACCEPT_ENCODING: 'gzip, deflate, br'
    },
    metadata: socketDefinition.endpoints[endpointName]
  };
  if (metaUpdate) {
    meta = (0, _lodash2.default)(meta, metaUpdate);
  }
  return meta;
};

function run(endpoint, ctx = {}, params = {}) {
  const { args = {}, config = {}, meta = {} } = ctx;
  const mocks = params.mocks;
  const socketMeta = generateMeta(endpoint, meta);

  verifyRequest({ args, config, meta: socketMeta });

  return new _bluebird2.default(function (resolve, reject) {
    let output = null;

    const HttpResponse = function (code, data, mimetype) {
      let response = null;
      if (mimetype === 'json/application') {
        response = { code, mimetype, data: JSON.parse(data) };
      } else {
        response = { code, data, mimetype };
      }
      response.is = responseType => verifyResponse(endpoint, responseType, response);
      return response;
    };

    const setResponse = function (response) {
      const processedResponse = response;
      if (response.mimetype === 'application/json') {
        processedResponse.data = JSON.parse(response.data);
      }
      resolve(processedResponse);
    };

    process.exitOrig = process.exit;
    process.exit = () => {};

    module.filename = `${compiledScriptsFolder}/${endpoint}.js`;

    try {
      let runFunc;
      if (mocks) {
        runFunc = (0, _proxyquire2.default)(_path2.default.join(socketScriptsFolder, `${endpoint}.js`), mocks).default;
      } else {
        runFunc = require(_path2.default.join(socketScriptsFolder, `${endpoint}.js`)).default;
      }
      output = runFunc({ args, config, meta: socketMeta, HttpResponse, setResponse });
    } catch (err) {
      reject(err);
    } finally {
      _bluebird2.default.resolve(output).then(resolve);
    }
  });
}

exports.run = run;
exports.generateMeta = generateMeta;