[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)   [![CircleCI](https://circleci.com/gh/Syncano/syncano-client-js.svg?style=shield&circle-token=2efee697e0cee80591aec86e022a9dbe0b3b25b8)](https://circleci.com/gh/Syncano/syncano-client-js)   [![codecov](https://codecov.io/gh/Syncano/syncano-client-js/branch/devel/graph/badge.svg)](https://codecov.io/gh/Syncano/syncano-client-js)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=102)](https://github.com/ellerbrock/open-source-badge/)
[![Open Source Love](https://badges.frapsoft.com/os/mit/mit.svg?v=102)](https://github.com/ellerbrock/open-source-badge/)


# Installation

The `Syncano Client` side library enables you to interact with the Syncano Sockets in your backend via front end Javascript code.

Installing from NPM:

```sh
npm install syncano-client --save
```

Library is also at [JSDELIVR](http://www.jsdelivr.com/projects/syncano-client-js):
```html`
<script src="//cdn.jsdelivr.net/syncano-client-js/latest/syncano-client.min.js"></script>
```

When the library is installed you can import it. The library supports the CommonJS syntax:

```js
var Syncano = require('syncano-client');
```

You can also use it with ES6 modules:

```js
import Syncano from 'syncano-client';
```

## Connection

To create a connection, simply initialize the Syncano object with instance name:

```js
const s = new Syncano('MY_INSTANCE_NAME')
```


`Syncano(instanceName, options?)`

| Parameter | Type | Description |
|-----------|------|-------------|
| **`instanceName`** | String | Syncano instance name. You can create one using [Syncano CLI](https://github.com/Syncano/syncano-node-cli). |
| **`options`** | Object | Optional connection config. |
| **`options.host`** | String | Syncano host name. |
| **`options.token`** | String | Allows you to initialize authorized connection. |
| **`options.loginMethod`** |  Function | Define custom login method |
