[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)   [![CircleCI](https://circleci.com/gh/Syncano/syncano-server-js/tree/devel.svg?style=shield&circle-token=0340c11444db6f3dc227cf310f4d8ff1bd90dee8)](https://circleci.com/gh/Syncano/syncano-server-js/tree/devel)
[![codecov](https://codecov.io/gh/Syncano/syncano-server-js/branch/devel/graph/badge.svg)](https://codecov.io/gh/Syncano/syncano-server-js)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=102)](https://github.com/ellerbrock/open-source-badge/)
[![Open Source Love](https://badges.frapsoft.com/os/mit/mit.svg?v=102)](https://github.com/ellerbrock/open-source-badge/)



# Installation

The Server Side library should be used in the **Syncano Sockets** (inside the scripts powering the Syncano Sockets) to communicate with the **Syncano Core Services** and 3rd party integrated platforms. Syncano provides various Core Services:
- **Database (db)** - NoSQL database to store your application data
- **Users Management (users)** - service to store and manage users and groups of your application
- **Event Loop (events)** - service to emit events which can be caught by any Socket
- **Realtime Channels (channels)** - implement publish/subscribe model for realtime communication

Library is by default a Syncano Socket dependency, you can check `package.json` file of your Socket:

```sh
cat <my-project>/syncano/<my-socket-name>/package.json
```

```json
{
  "dependencies": {
    "syncano-server": "0.8.9"
  }
}
```

If `syncano-server` is not listed there you can use `yarn` to install it (you have to be inside Socket folder):
```sh
cd <my-project>/syncano/<my-socket-name>/package.json
yarn add syncano-server
```
