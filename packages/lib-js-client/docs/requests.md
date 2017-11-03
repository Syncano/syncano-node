# Requests

Easy way to call Syncano Sockets.

# Methods

| Name                                      | Description               |
| ----------------------------------------- | ------------------------- |
| [Syncano](#syncanoinstanceName-options)   | Create Syncano connection |
| [s](#sendpoint-data-options)              | Send POST request         |
| [s.get](#sgetendpoint-data-options)       | Send GET request          |
| [s.post](#spostendpoint-data-options)     | Send POST request         |
| [s.patch](#spatchendpoint-data-options)   | Send PATCH request        |
| [s.put](#sputendpoint-data-options)       | Send PUT request          |
| [s.delete](#sdeleteendpoint-data-options) | Send DELETE request       |

## `Syncano(instanceName, options?)`

| Type   | Name                | Default       | Description                                                        |
| ------ | ------------------- | ------------- | ------------------------------------------------------------------ |
| string | **`instanceName`**  | undefined     | Syncano Instance name. You can create one using [Syncano CLI][cli] |
| object | **`options`**       | {}            | Additional connection options                                      |
| string | **`options.host`**  | syncano.space | Syncano host name.                                                 |
| string | **`options.token`** | undefined     | Allows you to initialize authorized connection.                    | **** |

**Create connection**

```js
const s = new Syncano('INSTANCE_NAME')
```

## `s(endpoint, data?, options?)`

| Type            | Name                  | Default   | Description                                         |
| --------------- | --------------------- | --------- | --------------------------------------------------- |
| string          | **`endpoint`**        | undefined | Name of socket and endpoint joined with '/'         |
| object/FormData | **`data`**            | {}        | Optional object send with request                   |
| object          | **`options`**         | {}        | Optional request configuration, see `axios` options |
| string          | **`options.headers`** | {}        | Request headers                                     |

Alias of `s.post` method.

## `s.get(endpoint, data?, options?)`

Send `GET` request to Syncano Socket.

**Simple Request**

```js
// countries - socket name
// list - endpoint name
s.get('countries/list')
  .then(res => {
    // Handle response
  })
  .catch(err => {
    // Handle error
  })
```

**Pass additional data to request**

```js
s.get('countries/list', { order_by: 'name' })
```

**Send request with headers**

```js
s.get('countries/list', {}, {
  headers: {
    'Content-Type': 'application/json'
  }
})
```

For more options, view [axios documentation](https://www.npmjs.com/package/axios)

## `s.post(endpoint, data?, options?)`

Send `POST` request to Syncano Socket. View `s.get` method for more info.

## `s.delete(endpoint, data?, options?)`

Send `DELETE` request to Syncano Socket. View `s.get` method for more info.

## `s.put(endpoint, data?, options?)`

Send `PUT` request to Syncano Socket. View `s.get` method for more info.

## `s.patch(endpoint, data?, options?)`

Send `PATCH` request to Syncano Socket. View `s.get` method for more info.

[cli]: https://github.com/Syncano/syncano-node/tree/master/packages/cli
