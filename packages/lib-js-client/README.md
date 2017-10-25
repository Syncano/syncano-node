[![CircleCI](https://circleci.com/gh/Syncano/syncano-client-js.svg?style=shield&circle-token=2efee697e0cee80591aec86e022a9dbe0b3b25b8)](https://circleci.com/gh/Syncano/syncano-client-js)   [![codecov](https://codecov.io/gh/Syncano/syncano-client-js/branch/devel/graph/badge.svg)](https://codecov.io/gh/Syncano/syncano-client-js)

# Syncano Client Library

This library enables you to interact with the Syncano Sockets via Javascript.

## Getting started

**Installing from NPM**

    npm install syncano-client --save

**Also available at [UNPKG](https://unpkg.com/syncano-client)**

    <script src="https://unpkg.com/syncano-client"></script>

**Usage**

The library supports the CommonJS syntax:

```js
var Syncano = require('syncano-client')
```

You can also use it with ES6 modules:

```js
import Syncano from 'syncano-client'
```

**Creating a connection**

To create a connection, simply initialize the Syncano object with instance name:

```js
const s = new Syncano('MY_INSTANCE_NAME')
```

## Constructor

### `Syncano(instanceName, options?)`

| Parameter | Type | Description |
|-----------|------|-------------|
| **`instanceName`** | String | Syncano instance name. You can create one using [Syncano CLI](https://github.com/Syncano/syncano-node-cli). |
| **`options`** | Object | Optional connection config. |
| **`options.host`** | String | Syncano host name. |
| **`options.token`** | String | Allows you to initialize authorized connection. |
| **`options.loginMethod`** |  Function | Define custom login method |

## Methods

### `s(endpoint, data?, options?)`

Alias of `s.post` method.

### `s.login(username, password)`

Before you can send authorized requests, you need to login user with username and password. This method will automatically save user token for future requests.

```js
s.login('john.doe', 'secret')
  .then(user => console.log(`Hello ${user.first_name}`))
  .catch(() => console.log('Invalid username or password.'))
```

### `s.logout()`

Remove user token for future requests.

### `s.setToken(token)`

Used to restore client session with token.

| Parameter | Type | Description |
|-----------|------|-------------|
| **`token`** | String | User token used to authorize requests.  |

To remove token, call setToken without parameter:

```js
s.setToken()
```

### `s.get(endpoint, data?, options?)`

Send `GET` request to Syncano socket.

| Parameter | Type | Description |
|-----------|------|-------------|
| **`endpoint`** | String | Name of socket and endpoint joined with '/':  |
| **`data`** | Object | Optional object send with request. |
| **`options`** | Object | Optional request configuration. |


```js
// countries - socket name
// list - endpoint name
s.get('countries/list')

// Pass additional data to request
s.get('countries/list', { order_by: 'name' })

// Configure request
s.get('countries/list', {}, {
  headers: {
    'Content-Type': 'application/json'
  }
})
```

For more options, view [axios documentation](https://www.npmjs.com/package/axios)

### `s.post(endpoint, data?, options?)`

Send `POST` request to Syncano Socket. View `s.get` method for more info.

### `s.delete(endpoint, data?, options?)`

Send `DELETE` request to Syncano Socket. View `s.get` method for more info.

### `s.put(endpoint, data?, options?)`

Send `PUT` request to Syncano Socket. View `s.get` method for more info.

### `s.patch(endpoint, data?, options?)`

Send `PATCH` request to Syncano Socket. View `s.get` method for more info.

### `s.subscribe(endpoint, data?, callback)`


Subscribe to given Syncano endpoint. Callback is fired each time something is pushed to channel bound to endpoint.

```js
// your-client-side-file.js
// chat - socket name
// poll-messages - endpoint name
s.subscribe('chat/poll-messages', message => {
  // Handle message
})
```

**Public channels**

```yml
# chat/socket.yml
endpoints:
  global-messages:
    channel: global-messages
  create-message:
    file: scripts/create-message.js
```

```js
// chat/scripts/create-message.js
import {data, channel} from 'syncano-server'

data.messages
  .create({
    content: ARGS.content,
    user: META.user.id
  })
  .then(message => {
    channel.publish(`global-messages`, message)
  })
```

**Room channels**

```yml
# chat/socket.yml
endpoints:
  private-messages:
    channel: private-messages.{room}
  create-message:
    file: scripts/create-message.js
```

```js
// chat/scripts/create-message.js
import {data, channel} from 'syncano-server'

data.messages
  .create({
    room_id: ARGS.room_id,
    content: ARGS.content, 
    user: META.user.id
  })
  .then(message => {
    channel.publish(`private-messages.${ARGS.room_id}`, message)
  })
```

```js
s.subscribe('chat/private-messages', {room: 1}, message => {
  // Handle message
})
```

**User channels**

First, you have to use special variable `{user}` in your channel name. It'll be used to check if user trying to access endpoint have rights to do it.

```yml
# notifications/socket.yml
endpoints:
  get:
    channel: notifications.{user}
  notify:
    file: scripts/notify.js
```

Then you can subscribe to channel by passing socket and endpoint name. User channels require `user_key` to be send in payload. 

```js
s.subscribe('notifications/get', {user_key: 'USER_KEY'}, notification => {
  // Handle notification
})
```

To publish to the user channel, you have to know it's `username`. 

> In channel name `notifications.{user}` - `{user}` must always be `username`, not id or any other property.

```js
// notifications/scripts/notify.js
import {data, channel} from 'syncano-server'

data.notifications
  .create({
    content: ARGS.content,
    username: ARGS.username
  })
  .then(notification => {
    channel.publish(`notifications.${ARGS.username}`, notification)
  })
```

### `s.subscribe.once(endpoint, data?, callback)`

Sometimes you want to listen only for one event and after that stop handling new events.

```js
s.subscribe.('user-auth/verify', isVerified => {
  // Handle verification
})
```
