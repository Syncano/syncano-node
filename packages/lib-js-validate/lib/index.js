'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ajv = require('ajv');

var _ajv2 = _interopRequireDefault(_ajv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Validator {
  constructor(ctx) {
    if (!ctx) {
      throw new Error('You have to provide Syncano context!');
    }
    this.ctx = ctx;
    this.requestData = ctx.args;
    this.endpointDefinition = ctx.meta.metadata;
    this.endpointRequestSchema = this.endpointDefinition.parameters;
  }

  static validate(schema, data) {
    const ajv = new _ajv2.default();
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      const detailsMsg = validate.errors.map(err => {
        return `     - ${err.message} (${JSON.stringify(err.params)})`;
      }).join('\n');

      const error = new Error(`\n\n    Validation error:\n${detailsMsg}\n`);
      error.details = validate.errors;
      throw error;
    }
    return true;
  }

  validateRequest() {
    var _this = this;

    return _asyncToGenerator(function* () {
      // if (!this.endpointRequestSchema || !_.isEmpty(this.endpointRequestSchema)) {
      //   return true
      // }

      const schema = {
        type: 'object',
        properties: _this.endpointRequestSchema,
        additionalProperties: false
      };

      return Validator.validate(schema, _this.requestData);
    })();
  }

  validateResponse(responseType, response) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      if (!responseType || !response) {
        throw new Error('You have to specify responseType and response argument!');
      }
      const responseDefinition = _this2.endpointDefinition.response[responseType];
      const responseDefinitionParameters = responseDefinition.parameters;

      const desiredExitCode = responseDefinition.exit_code || 200;
      const desiredMimetype = responseDefinition.mimetype || _this2.endpointDefinition.response.mimetype || 'application/json';

      // We are not validating non-json repsonses
      if (desiredMimetype !== 'application/json') {
        return response;
      }

      // Should we validate empty schema?
      // if (!responseDefinitionParameters || !_.isEmpty(responseDefinitionParameters)) {
      //   return true
      // }

      if (response.code !== desiredExitCode) {
        throw new Error(`Wrong exit code! Desired code is ${desiredExitCode}, got: ${response.code}`);
      }

      if (response.mimetype !== desiredMimetype) {
        throw new Error(`Wrong mimetype! Desired mimetype is ${desiredMimetype}, got: ${response.mimetype}`);
      }

      const schema = {
        type: 'object',
        properties: responseDefinitionParameters,
        additionalProperties: false
      };

      Validator.validate(schema, response.data);
      return response;
    })();
  }
}
exports.default = Validator;