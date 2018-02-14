# Usage

## Call endpoint

To call Syncano Socket endpoint use:

`s(<socket-name>/<endpoint-name>, data?, options?)`
> This is an alias of `s.post` method.

| Parameter | Type | Description |
|-----------|------|-------------|
| **`endpoint`** | String | Name of socket and endpoint joined with '/':  |
| **`data`** | Object | Optional object send with request. |
| **`options`** | Object | Optional request configuration. |

Example:
```javascript
// countries - socket name
// list - endpoint name
s('countries/list')
  .then(response => {
    console.log(response)
  })
```

#### HTTP request types
To specify particular type of HTTP request, use:

`s.<request type>(<socket-name>/<endpoint-name>, data?, options?)`

For example:
```javascript
s.get('hello/test')
s.put('hello/test')
s.delete('hello/test')
s.patch('hello/test')
```

!> Specifying the HTTP request method will result in sending a `POST` request
with an extra `"_method": "method type"` params available in `ctx.args`
on the server side.

#### Options

Example of passing additional options to the request:

```javacript
// Configure request
s.get('countries/list', {}, {
  headers: {
    'Content-Type': 'application/json'
  }
})
```

!> For more options, view [axios documentation](https://www.npmjs.com/package/axios)

## Log in user

`s.login(username, password)`

Before you can send authorized requests, you need to log in user with username and password. This method will automatically save user token for future requests.

```js
s.login('john.doe', 'secret')
  .then(user => console.log(`Hello ${user.first_name}`))
  .catch(err => console.log('Invalid username or password.'))
```

## Log out user

Remove user token for future requests:
```js
s.logout()
```

## Restore user session
`s.setToken(token)`

Used to restore user session with token.

| Parameter | Type | Description |
|-----------|------|-------------|
| **`token`** | String | User token used to authorize requests.  |

To remove token, call setToken without parameter:

```js
s.setToken()
```

?> Usually you want to store user session in `localStorage` or `sessionStorage`. `setToken` is helpful when you want restore a session for a user without asking for a username and password

## Subscribe to channel endpoint

 `s.subscribe(socket-name>/<endpoint-name>, callback)`

You can subscribe to the live updates from the endpoints which are configured to expose real-time channel.
Callback is fired each time you receive message from endpoint.

```js
// chat - socket name
// messages - endpoint name
s.subscribe('chat/messages', message => {
  // Handle message
  console.log(message)
})
```

You can also use `once` method to get only first message. After receive messages, connection with channel will be closed.

`s.subscribe.once(socket-name>/<endpoint-name>, callback)`

```js
s.subscribe.once('chat/messages', message => {
  // Will be executed only once - after the first message
  console.log(message)
})
```
