# Authentication

Authenticate calls to Syncano Sockets.

# Methods

| Name                           | Description                |
| ------------------------------ | -------------------------- |
| [s.setToken](#settokenuserkey) | Set authenticated user key |

## `s.setToken(userKey?)`

Used to authenticate Syncano Client requests with user key.

| Type   | Name          | Default   | Description               |
| ------ | ------------- | --------- | ------------------------- |
| string | **`userKey`** | undefined | Key of authenticated user |

```js
s.setToken('user-key-abcdefghijk')
```

To remove user key, call setToken without parameter:

```js
s.setToken()
```
