# Channels

Listen on Syncano Realtime Channels.

# Methods

| Name                                                      | Description                                  |
| --------------------------------------------------------- | -------------------------------------------- |
| [s.subscribe](#ssubscribeendpoint-data-callback)          | Listen on given channel                      |
| [s.subscribe.once](#ssubscribeonceendpoint-data-callback) | Listen only for first event on given channel |

## `s.subscribe(endpoint, data?, callback)`

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

## `s.subscribe.once(endpoint, data?, callback)`

Sometimes you want to listen only for one event and after that stop handling new events.

```js
s.subscribe.('user-auth/verify', isVerified => {
  // Handle verification
})
```
