# Tools and Libraries

## Syncano tools
The Syncano toolchain currently consists of:

- `CLI` (*@syncano/cli*) - command-line interface to operate the whole platform
- `Client Library` (*@syncano/lib-js-client*) - library used on the client-side (application, website etc.)
- `Server-side Library` (*@syncano/lib-js-core*) - used inside the Socket's scripts for communication with Core Syncano Services (e.g. build-in database)
- `Test Library` (*@syncano/test*) - test library that helps run Syncano endpoints locally
- `Validate Library` (*@syncano/validate*) - library used to validate input/outputs base on Syncano Sockets definitions

### The Syncano CLI

Use the Syncano Command Line interface (CLI) to manage the whole build and deploy process. You can get it from npm with `npm install @syncano/cli` command (it requires Node to be installed). It's a powerful terminal tool, so you won't have to leave your working environment. The whole synchronization and deployment process happens automatically and seamlessly.

See the [Syncano CLI Reference](/cli-reference/installation) for more information about the commands and possible options.

### The Syncano Core API

The Syncano Cloud OS is the core of the technical platform. It hosts and executes the Syncano Sockets that your dedicated backend is assembled from, and consists of. It also ensures that your backend scales elastically to meet your front end’s ever changing needs.

Today, Syncano Cloud OS runs on AWS but we have ensured that it can be run on other cloud infrastructure providers like Google, Azure, IBM, et. al. We also ensured that it can be run on any private infrastructure, basically enabling the possibility to run on-premise, and thus complying with European Safe Harbour regulations, and EU’s Personal Data Act.

### Core Library

The Core Library is used to communicate with the Syncano Cloud OS. The scripts that use the Syncano Core library are executed on the server side. It’s the functionality that runs the code that is powering the Syncano Sockets and makes sure they are executed at blazing speed with the right environment and runtime.

In order to use the Syncano Server Library, simply include it in your server side scripts, like so:

```javascript
import Syncano from '@syncano/core'

export default (ctx) => {
  const { data } = new Syncano(ctx)

// And then to handle the data
  const awesomeMovie = await data.movies
    .where('title', 'Fight Club')
    .first()
}
```

See the [Core Lib Reference](https://github.com/Syncano/syncano-node/blob/master/packages/lib-js-core/docs/readme.md) for more information on how to use it.


### The Syncano Client Library

A very lightweight front-end library that was created to call the endpoints which expose the Syncano Core API endpoints. Configuration is amazingly simple. To use it, add these couple of lines to your front end (js) code:

```javascript
<script src="https://unpkg.com/@syncano/client"></script>
<script>
  const s = new SyncanoClient('MY_INSTANCE_NAME')

  s.get('my/endpoint')
   .then(data => {
     console.log(data)
   })
</script>
```

### Sockets in NPM

You can find plenty of ready to use components and backend blueprints, all created by the Syncano community. You can immediately start using them to compose your dedicated and customized backend. You can easily create your own building blocks should you need additional functionality.
