# Events

With `event` method you're able to:

- Publish global events to which other sockets can subscribe

# Import

```js
const {event} = new Server(ctx)
```

# Methods

| Name                                    | Description          |
| --------------------------------------- | -------------------- |
| [event.publish](#eventemitname-payload) | Publish global event |


## `event.emit(name, payload?)`

| Type   | Name    | Default | Description                       |
| ------ | ------- | ------- | --------------------------------- |
| string | name    | null    | Event name                        |
| object | payload | null    | Additional data passed with event |

#### Emiting event

```
event.emit('email_sent', {to: 'mail@example.com'})
```

#### Catching event in socket.yml

```yaml
event_handlers:
  events.socket_name.email_sent:
    file: email-sent.js
```
