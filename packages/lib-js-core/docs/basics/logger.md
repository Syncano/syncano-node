# Endpoints

With `logger` method you're able to:

- Create console messages
- Listen to logged messages

# Import

```js
const {logger} = new Server(ctx)
```

# Methods

| Name                     | Description                           |
| ------------------------ | ------------------------------------- |
| [logger](#logger)        | Initialize log methods in given scope |
| [logger.listen](#logger) | Listen for logged messages            |

## `logger(scope)`

Initialize log methods.

| Type   | Name  | Default | Description                                                         |
| ------ | ----- | ------- | ------------------------------------------------------------------- |
| string | scope | null    | Name of logger scope. Usualy in format `socket-name@endpoint-name:` |

```js
const {debug, error, warn, info} = logger('socket-name@endpoint-name:')

debug('This is debug message!')
error('This is error message!')
warn('This is warning message!')
info('This is info message!', {hello: "world"})
```

## `logger.listen(callback)`

| Name     | Name     | Default | Description                                                                                        |
| -------- | -------- | ------- | -------------------------------------------------------------------------------------------------- |
| function | callback | null    | Function which is called each time one of log methods is used. `event` is passed to this function. |

```js
logger.listen(event => {
  // Handle event - save to db or send email 
})
```
