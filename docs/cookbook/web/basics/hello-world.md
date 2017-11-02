# Hello World

- Preparation: **3 minutes**
- Requirements:
  - Initiated Syncano project

### Problem to solve

You want to create API endpoint which is always printing *Hello World!* message. No authentication, no authorization. Simple as that.

### Solution

Create `hello-world` Socket and `hello` endpoint with simple response.

#### Create Hello World Socket

```sh
syncano-cli create hello-world --template empty
```

#### Create endpoint file

```sh
syncano-cli deploy hello-world
```
```
socket synced: 17:10:06 hello-world 3943 ms
```

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
