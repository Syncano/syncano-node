"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.withSyncano = withSyncano;
var SyncanoContext = exports.SyncanoContext = React.createContext();

// This function takes a component...
function withSyncano(Component) {
  // ...and returns another component...
  return function SyncanoComponent(props) {
    // ... and renders the wrapped component with the context theme!
    // Notice that we pass through any additional props as well
    return React.createElement(
      SyncanoContext.Consumer,
      null,
      function (syncano) {
        return React.createElement(Component, _extends({}, props, { syncano: syncano }));
      }
    );
  };
}
