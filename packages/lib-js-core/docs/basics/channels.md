# Channels

With `channel` method you're able to:

- Publish messages to realtime channels

# Import

```js
const {channel} = new Server(ctx)
```

# Methods

| Name                                              | Description                |
| ------------------------------------------------- | -------------------------- |
| [channel.publish](#channelpublishchannel-payload) | Publish message to channel |


## `channel.publish(channel, payload?)`

| Type   | Name    | Default | Description                       |
| ------ | ------- | ------- | --------------------------------- |
| string | channel | null    | Name of the channel               |
| object | payload | null    | Additional data passed to channel |

#### Publishing to public channel

```yaml
endpoints:
  messages:
    channel: messages
```

```js
channel.publish('messages', {content: 'hello'})
```

#### Publishing to channel room

```yaml
endpoints:
  messages:
    channel: messages.{room}
```

```js
channel.publish(`messages.${room}`, {content: 'hello'})
```

#### Publishing to user private channel

```yaml
endpoints:
  messages:
    channel: messages.{user}
```

```js
channel.publish(`messages.${username}`, {content: 'hello'})
```
