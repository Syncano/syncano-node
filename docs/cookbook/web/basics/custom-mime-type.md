# Response with custom mime-type

- Preparation: **1 minute**
- Requirements:
  - Initiated Syncano project

### Problem to solve

You want to create API endpoint which is generating response with `text/plain` mime-type.

### Solution

Create empty `hello-world` Socket and `hello` endpoint with custom response.

#### Create Socket

```sh
npx s create hello-world --template example
```

#### Edit endpoint file

Edit file `syncano/hello-world/src/hello.js` and change its content to:

```js
import Syncano from '@syncano/core'

export default (ctx) => {
  const {response} = new Syncano(ctx)
  response('hello world!', 200, 'text/plain')
}
```

Edit file `syncano/hello-world/socket.yml` and change its content to:

```yaml
name: hello-world

endpoints:
  hello:
    description: Hello world!
```

> Note that we are using here `response()` instead of `response.json()`.

### How it works?

Now you can find URL for `hello` endpoint by typing `npx s list hello-world`:

```sh
    socket: hello-world 
    description: Hello World Socket
    version: 0.0.1 
    type: local Socket 
    status: ok 
 
        endpoint: hello-world/hello 
        description: Hello world! 
        url: https://bold-haze-9618.syncano.space/hello-world/hello/ 
```

and call it using your browser or any other HTTP client:

```sh
curl https://bold-haze-9618.syncano.space/hello-world/hello/
```

Response will have `text/plain` mime-type.
