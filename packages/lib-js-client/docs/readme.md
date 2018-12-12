# Documentation

- [Cheat Sheet][cheatsheet]
- Getting Started
  - [Usage](#usage-in-syncan/socket)
  - [Installation](#installation)
- The Basics
  - [Authentication](authentication.md)
  - [Requests](requests.md)
  - [Channels](channels.md)

## Usage 

The library supports the CommonJS syntax:

```js
var Syncano = require('@syncano/client')
```

You can also use it with ES6 modules:

```js
import Syncano from '@syncano/client'
```

**Create a connection**

To create a connection, simply initialize the Syncano object with instance name:

```js
const s = new Syncano('INSTANCE_NAME')
```

You can create instance via [Syncano CLI][cli].

**Call socket**

```js
s.post('socket_name/endpoint_name').then(res => {
  // Handle response
})
```

**Call socket with parameters**

```js
s.post('socket_name/endpoint_name', {
  city: 'Warsaw'
}).then(res => {
  // Handle response
})
```

## Installation

**Installing from NPM**

```bash
npm i @syncano/client --save
```

**Also available at [UNPKG](https://unpkg.com/@syncano/client@latest/dist/index.js)**

```html
<script src="https://unpkg.com/@syncano/client@latest/dist/index.js"></script>
```

[cheatsheet]: https://cheatsheet.syncano.io/#client
[cli]: https://github.com/Syncano/syncano-node/tree/master/packages/cli
