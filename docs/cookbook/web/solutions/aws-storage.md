# AWS S3 Storage

- Preparation: **5 minutes**
- Requirements:
  - Initiated Syncano project
  - config with [aws-config](/solutions/aws-config)
- Sockets:
  - [aws-storage](https://syncano.io/#/sockets/aws-storage)

## Problem to solve

It's very common that an application needs a file storage for user data. While Syncano provides this functionality with a `file` type in Data Objects, there may be cases where a custom solution is more suitable.

## Solution

A socket providing an integration with an S3 storage on AWS and solving the following use cases:
- [Storing files that are accessible only by their owner](#user-managed-files)
- [Storing files that are owned by a user and available for other selected users](#socket-managed-files)
- [Admin managed files](#upload-files-from-sockets)

#### Pre installation
If you haven't done that already please [configure](/solutions/aws-config) your Syncano instance

#### Installing dependencies

To install `aws-storage` type:
```sh
$ npx s add aws-storage
$ npx s deploy
```


### User managed files
You want to store files that are owned by a user and only show it to that user. Call that url with `_user_key` as a parameter or being logged in within Syncano client library.

#### Get upload links for user files( recommended )

Instead of transferring files with put you can receive temporary user upload link which will allow to send file directly to AWS

**Required parameters:**

`name=[string]` - file name

`_user_key=[string]` - user key only when not using syncano-client library
```
https://<your_instance_name>.syncano.space/aws-storage/user-upload-link/
```
After that call you will receive temporary upload link with which you can upload your file directly to S3

#### Reading a file

Then you can retrieve your file

**Required parameters:**

`name=[string]` - file name

`_user_key=[string]` - user key only when not using syncano-client library
```
https://<your_instance_name>.syncano.space/aws-storage/user-read/
```

#### Put base 64 files
You can also put files directly with POST request if you need so.

**Required parameters:**

`file=[string]` - base 64 encoded file

`name=[string]` - file name

`_user_key=[string]` - user key only when not using syncano-client library
```
https://<your_instance_name>.syncano.space/aws-storage/user-upload/
```


### Socket managed files

You want to store files that are private and you want to decide who will have access to them. This use case is very handy in social services backend. There you usually face the problem with image privacy. This is a plug-n-play solution!

#### Retrieve many files

Remember to only use this socket inside backend code.
```javascript
import Syncano from '@syncano/core'
export default async ctx => {
  const {data, response, socket} = new Syncano(ctx)
  try {
    const {user} = ctx.meta
    const fileLinks = await socket.post('aws-storage/make-links', {
      fileNames: [`${user.username}/file1.txt`, `${user.username}/file2.txt`]
    })
    return response.json(fileLinks)
  } catch ({message}) {
    return response.json(message, 400)
  }
}
```

### Upload files from sockets
99% of use cases are covered by above solutions. However, sometimes we need a more complicated administrator upload.

#### Upload from socket with link

Example backend code

**Required parameters:**

`name=[string]` - file name

`_user_key=[string]` - user key only when not using syncano-client library

```javascript
import Syncano from '@syncano/core'
export default async ctx => {
  const {data, response, socket} = new Syncano(ctx)
  try {
    const {name} = ctx.args
    const fileLink = await socket.post('aws-storage/admin-upload-link', {
      name
    })
    return response.json(fileLink)
  } catch ({message}) {
    return response.json(message, 400)
  }
}
```

#### Upload from socket with put

Example backend code

**Required parameters:**

`file=[string]` - base 64 encoded file

`name=[string]` - file name

`_user_key=[string]` - user key only when not using syncano-client library

```javascript
import Syncano from '@syncano/core'
export default async ctx => {
  const {data, response, socket} = new Syncano(ctx)
  try {
    const {name,fileb64} = ctx.args
    const fileLink = await socket.post('aws-storage/admin-upload', {
      name,
      file:fileb64
    })
    return response.json(fileLink)
  } catch ({message}) {
    return response.json(message, 400)
  }
}
```
