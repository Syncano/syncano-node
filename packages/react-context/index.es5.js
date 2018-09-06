'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SyncanoContext = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.withSyncano = withSyncano;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SyncanoContext = exports.SyncanoContext = _react2.default.createContext();

// This function takes a component...
function withSyncano(Component) {
  // ...and returns another component...
  return function SyncanoComponent(props) {
    // ... and renders the wrapped component with the context theme!
    // Notice that we pass through any additional props as well
    return _react2.default.createElement(
      SyncanoContext.Consumer,
      null,
      syncano => _react2.default.createElement(Component, _extends({}, props, { syncano: syncano }))
    );
  };
}
