# Response with custom status code

- Preparation: **1 minute**
- Requirements:
  - Initiated Syncano project

### Problem to solve

You want to create API endpoint which is generating response with `400` HTTP status code.

### Solution

Create empty `hello-world` Socket and `hello` endpoint with custom response.

#### Create Socket

```sh
syncano-cli create hello-world --template example
```

#### Edit endpoint file


Edit file `syncano/hello-world/src/hello.js` and change its content to:

```js
import Syncano from 'syncano-server'

export default (ctx) => {
  const {response} = Syncano(ctx)
  response.json({msg: 'Error!'}, 400)
  }
}

### How it works?

Now you can find URL for `hello` endpoint by typing `syncano-cli list hello-world`:

```
socket: hello-world
description: Hello World Socket
status: ok

    endpoint: hello-world/hello
    description: Hello endpoint
    url: https://bitter-sound-5197.syncano.space/hello-world/hello/
```

and call it using your browser or any other HTTP client:

```sh
curl https://bitter-sound-5197.syncano.space/hello-world/hello/
```

Response will have `text/plain` mime-type.
