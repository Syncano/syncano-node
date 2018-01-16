# Responses

With `response` method you're able to:

- Set response data, MIME type and status code
- Manage response headers.

# Import

```js
const {response} = new Server(ctx)
```

# Methods

| Name                                                 | Description           |
| ---------------------------------------------------- | --------------------- |
| [response](#responsecontent-status-mimetype-headers) | Set endpoint response |
| [response.header](#responseheaderkey-value)          | Set response header   |
| [response.json](#responsejsoncontent-status)         | Set json response     |


## `response(content, status?, mimetype?, headers?)`

| Type   | Name     | Default      | Description                 |
| ------ | -------- | ------------ | --------------------------- |
| any    | content  | null         | Response content            |
| number | status   | 200          | Response status code        |
| string | mimetype | 'text/plain' | Response media type         |
| object | headers  | {}           | Additional response headers |


```js
response('Hello world')

response('Hello world', 200, 'text/plain', {
  'X-RATE-LIMIT': 50
})
```

## `response.header(key, value)`

| Type   | Name  | Default | Description     |
| ------ | ----- | ------- | --------------- |
| string | key   | null    | Name of header  |
| string | value | null    | Value of header |

```js
response
  .header('X-RATE-LIMIT', 50)
  .header('X-USAGE', 35)
  ('Check headers', 200, 'plain/text')
```

## `response.json(content, status?)`

**Parameters**

| Type   | Name    | Default | Description          |
| ------ | ------- | ------- | -------------------- |
| object | content | null    | Response content     |
| number | status  | 200     | Response status code |

```js
response.json({message: 'Unauthorized'}, 401)

response
  .header('X-RATE-LIMIT', 50)
  .json({title: "Post title"})
```
