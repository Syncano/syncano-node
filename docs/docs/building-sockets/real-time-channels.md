# Real-time channels

Channels is a web socket that gives the posibility to create applications which need to receive realtime data like chat

Listen on Syncano Realtime Channels.

**Methods**

| Name                                                      | Description                                  |
| --------------------------------------------------------- | -------------------------------------------- |
| [s.listen](#slistenendpoint-params)                       | Listen on given channel                      |

## `s.listen(endpoint, params?)`

Subscribe to given Syncano endpoint. `s.listen` returns instance of [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket).

```js
// your-client-side-file.js
// chat - socket name
// poll-messages - endpoint name
s.listen('chat/poll-messages')
  .addEventListener('message', message => {
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
    file: src/create-message.js
```

```js
// chat/src/create-message.js
import Syncano from '@syncano/core'

export default (ctx) => {
  const {channels} = new Syncano(ctx)
  const {args} = ctx

  channel.publish(`global-messages`, args.message)
}
```

**Room channels**

```yml
# chat/socket.yml
endpoints:
  private-messages:
    channel: private-messages.{room}
  create-message:
    file: src/create-message.js
```

```js
// chat/src/create-message.js
import Syncano from '@syncano/core'

export default (ctx) => {
  const {channels} = new Syncano(ctx)
  const {args} = ctx

  channel.publish(`private-messages.${args.room_id}`, message)
}
```

```js
s.listen('chat/private-messages', {room: 1})
  .addEventListener('message', message => {
    // Handle message
  })
```

**User channels**

First, you have to use special variable `{user}` in your channel name. It'll be used to check if a given user have rights to access endpoint.

```yml
# notifications/socket.yml
endpoints:
  get:
    channel: notifications.{user}
  notify:
    file: src/notify.js
```

Then you can subscribe to channel by passing socket and endpoint name. User channels require `user_key` to be send in payload.

```js
s.listen('notifications/get', {user_key: 'USER_KEY'})
  .addEventListener('message', notification => {
    // Handle notification
  })
```

To publish to the user channel, you have to know its `username`.

> In channel name `notifications.{user}` - `{user}` must always be a `username`, not id or any other property.

```js
// notifications/src/notify.js
import Syncano from '@syncano/core'

export default (ctx) => {
  const {channels, response} = new Syncano(ctx)
  const {user} = ctx.meta

  if(!meta.user) {
    return response.json("Unauthorized!", 401)
  }

  channel.publish(`notifications.${user.username}`, notification)
}
```
