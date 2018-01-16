# Endpoints

With `socket` method you're able to:

- Call other sockets via `POST`, `GET`, `PATCH`, `PUT`, `DELETE` methods

# Import

```js
const {socket} = new Server(ctx)
```

# Methods

| Name                                                | Description         |
| --------------------------------------------------- | ------------------- |
| [socket](#socketendpoint-data-options)              | Send POST request   |
| [socket.post](#socketpostendpoint-data-options)     | Send POST request   |
| [socket.get](#socketgetendpoint-data-options)       | Send GET request    |
| [socket.patch](#socketpatchendpoint-data-options)   | Send PATCH request  |
| [socket.put](#socketputendpoint-data-options)       | Send PUT request    |
| [socket.delete](#socketdeleteendpoint-data-options) | Send DELETE request |

## `socket(endpoint, data?, options?)`

| Type   | Name     | Default | Description                                         |
| ------ | -------- | ------- | --------------------------------------------------- |
| string | endpoint | null    | Endpoint name in format `socket-name/endpoint-name` |
| object | data     | {}      | Additional data send to endpoint                    |
| object | options  | {}      | Options passed to `node-fetch`                      |

```js
socket('posts/create', {title: 'Lorem ipsum'})
```

## `socket.post(endpoint, data?, options?)`

```js
socket.post('posts/create', {title: 'Lorem ipsum'})
```

## `socket.get(endpoint, data?, options?)`

```js
socket.get('posts/latest')
```

## `socket.patch(endpoint, data?, options?)`

```js
socket.patch('posts/update', {id: 10, title: 'Dolor sit amet'})

```
## `socket.put(endpoint, data?, options?)`

```js
socket.put('posts/update', {id: 23, title: 'Dolor sit amet'})
```

## `socket.delete(endpoint, data?, options?)`

```js
socket.delete('posts/delete', {id: 23})
```
