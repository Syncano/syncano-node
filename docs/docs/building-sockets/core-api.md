# Using Core library

Syncano provides various Core Services and Core library contains an interface to intereact with them:

- **Database (data)** - NoSQL database to store your application data
- **Users Management (users)** - service to store and manage users and groups of your application
- **Event Loop (events)** - service to emit events which can be caught by any Socket
- **Realtime Channels (channels)** - implement publish/subscribe model for realtime communication

Core library also contains number of helpers to make working with scripts easy:

- **Response method (response)** - lets you send response from the script
- **Logging (logger)** - logger which helps with debugging scripts and measuring time of execution

Core library is by default Syncano Socket dependency, you can check `package.json` file of your Socket:

```sh
cat <my-project>/syncano/<my-socket-name>/package.json
```

```json
{
  "dependencies": {
    "@syncano/core": "0.13.0"
  }
}
```

If `@syncano/core` is not listed there you can use `npm` to install it (you have to be inside Socket folder):
```sh
cd <my-project>/syncano/<my-socket-name>/package.json
npm add @syncano/core
```

## Library initialization

To initialize library simply import it in a Socket script where library will be used:

```javascript
import Syncano from '@syncano/core'

export default (ctx) => {
  const { data, users, endpoint, response, event, logger } = new Syncano(ctx)

  // Now you can access the database easily, e.g.:
  // const awesomeMovie = await data.movies.where('title', 'Fight Club').first()

}
```

## Core API

### Database (data)

In this example `tags` is a name of a class (data model) configured for that instance.

```js
// Create new object in tags class
data.tags
  .create({
    name: 'javascript',
    usage_count: 0
  })
  .then(tag => {});

// Get list of 140 tags used more than 100 times
data.tags
  .where('usage_count', 'gt', 100)
  .take(140)
  .list()
  .then(tags => {})

// Get list of post where author is reference to other class
// and author email is john@example.com
data.posts
  .where('author.email', 'john@example.com')
  .list()
  .then(posts => {})

// Get list of post - author column will be expanded with data from target class
data.posts
  .with('author')
  .list()
  .then(posts => {})

// Delete tags with with given array of ids
data.tags.delete([8735, 8733])

// Delete single tag
data.tags.delete(7652)
```

### Users (users)

You can interact with `users` same way as you do with data.

```js
// Get first user with given mail
users
  .where('email', 'john.doe@example.com')
  .first()
  .then(user => {
    // user variable is null if not found
    // so no need for catch method
  })

// Get first user with given mail, throws error if user was not found
users
  .where('email', 'john.doe@example.com')
  .firstOrFail()
  .then(user => {})
  .catch(err => {
    // error is thrown if user was not found
  })
```

### Events (events)

Publish global `events` to which other sockets can subscribe.

```js
event.emit('my_signal', {dummyKey: 'dummy_value'})
  .then(event => {})
  .catch(err => {
    // error is thrown if emit was unsuccessful
  })
```

Catch `events` by subscribing to a socket emmiting an event.     

```yml
event_handlers:
  events.socket name.my_signal:
    file: my_signal.js
```

### Channels (channels)

You can create a public channel...

```yml
endpoints:
  messages:
    channel: my_channel
```
...and send realtime messages.

```js
channel.publish('my_channel', {dummyKey: 'dummy_value'})
  .then(res => {})
  .catch(err => {})
```

## Utils

### Response

Response lets you send custom responses from sockets.

```js
// Simple text/plain response
// response(content, status, contentType, headers)
response('Hello world')

response('Hello world', 200, 'text/plain', {
  'X-RATE-LIMIT': 50
})

// Respond with custom header
response
  .header('X-RATE-LIMIT', 50)
  .header('X-USAGE', 35)
  ('Check headers')

// Respond with json string
response.json({
  title: "Post title",
  content: "Lorem ipsum dolor sit amet."
})

// Respond with json string and custom header
response
  .header('X-RATE-LIMIT', 50)
  .json({
    title: "Post title",
    content: "Lorem ipsum dolor sit amet."
  })
```

### Logging

Easy way to debugg your script code. Think of it as your console.log but for your socket.

```js
// Listen for all events
logger.listen(event => {
  // Handle event - save to db or send email
})

// Create custom logger levels - optionally
// Defaults are: error, warn, debug, info
logger.levels(['error', 'notice', 'fatal'])

// Initialize logger with scope "User Socket"
const log = logger('User Socket')

// Specific level loggers
log.error('This is error message!')
log.warn('This is warning message!')
log.info('This is info message!', {hello: "world"})
log.debug('This is debug message!')
```
