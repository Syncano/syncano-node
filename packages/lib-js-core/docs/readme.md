# Documentation

- [Cheat Sheet][cheatsheet]
- Getting Started
  - [Usage in Syncano Socket](#usage-in-syncano-socket)
  - [Installation](#installation)
- The Basics
  - [Data](basics/data.md)
  - [Users](basics/users.md)
  - [Responses](basics/responses.md)
  - [Endpoints](basics/endpoints.md)
  - [Channels](basics/channels.md)
  - [Events](basics/events.md)
  - [Logger](basics/logger.md)

- <details>
  <summary>Architecture Concepts</summary>
  
  - [Socket](architecture/socket.md)*
  - [Socket Context](architecture/socket-context.md)*
</details>

- <details>
  <summary>Syncano Core</summary>

  - [Syncano Account](core/syncano-account.md)*
  - [Syncano Backups](core/syncano-backups.md)*
  - [Syncano Classes](core/syncano-classes.md)*
  - [Syncano Hostings](core/syncano-hostings.md)*
  - [Syncano Instances](core/syncano-instances.md)*
  - [Syncano Sockets](core/syncano-sockets.md)*
  - [Syncano Traces](core/syncano-traces.md)*
</details>

`*` - TODO

## Usage in Syncano Socket

To learn about Syncano Sockets visit [documentation][socket].

```js
import Syncano from 'syncano-server'
          
export default async ctx => {
  // Initialize Syncano Server Library
  const {data, response} = new Syncano(ctx)

  // Check if user is authenticated
  if (!ctx.meta.user) {
    response.json({message: 'Unauthorized'}, 401)
    process.exit(0)
  }

  // Get user id from Socket Context
  const {id: author} = ctx.meta.user
  const {title} = ctx.args

  // Create post
  const post = await data.posts.create({title, author})

  // Respond with created post
  response.json(post)
}
```

## Installation

To install Syncano Server Library, use npm or yarn in your [socket][socket].
<pre>
npm i <a href="https://www.npmjs.com/package/syncano-server">syncano-server</a> --save
</pre>

[socket]: https://syncano.github.io/syncano-node-cli/#/using-sockets/overview
[cheatsheet]: https://cheatsheet.syncano.io/#server
