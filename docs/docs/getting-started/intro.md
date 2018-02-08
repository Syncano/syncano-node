# Syncano Ecosystem

This is how the libraries relate to each other and how they complement other parts of the platform:
![High Level Diagram](/img/syncano_arch.png)


So, starting from the very top of the diagram:
1. Each of the devices has an opened website or an application. Those client side applications use the Syncano Client library, which is a lightweight wrapper for the API, which is what you can configure with the Syncano CLI.
2. Each call to the Syncano API goes through the server side scripts (part of the Sockets). These server side scripts use the Syncano Server library. The Server library handles the requests, user management and authentication, data management and realtime functionalities.
3. The Syncano Core API is the scalable and realtime cloud backend. It's the brain of the whole toolchain.
4. While the Syncano Core API is the brain, the Syncano CLI is the muscles and the nervous system. It integrates with your development workflow and enhances it with an extra boost that accelerates your software development.
5. Last part of the puzzle is the Syncano Sockets Registry. It is similar to npm, cocoapods, pip or nuget, but for the cloud backend. You access and manage it from the Syncano CLI.

## Syncano tools
The Syncano chain of tools currently consists:

- `CLI` - command-line interface to operate whole platform
- `Client Library` (*@syncano/lib-js-client*) - library used on the client-side (application, website etc.)
- `Server-side Library` (*@syncano/lib-js-core*) - used inside the Socket's scripts for communication with Core Syncano Services (e.g. build-in database)

### The Syncano CLI

Use the Syncano Command Line interface (CLI) to manage the whole build and deploy process. You can get it from npm with `npm install @syncano/cli` command (it requires Node to be installed). It's a powerful terminal tool, so you won't have to leave your working environment. The whole synchronization and deployment process happens automatically and seamlessly.

See the [Syncano CLI Reference](/cli-reference/installation) for more information about the commands and possible options.

### The Syncano Core API

The Syncano Cloud OS is the core of the technical platform. It hosts and executes the Syncano Sockets that your dedicated backend is assembled from, and consists of. It also ensures that your backend scales elastically to meet your front end’s ever changing needs.

Today, Syncano Cloud OS runs on AWS but we have ensured that it can be run on other cloud infrastructure providers like Google, Azure, IBM, et. al. We also ensured that it can be run on any private infrastructure, basically enabling the possibility run on-premise, and thus complying with European Safe Harbour regulations, and EU’s Personal Data Act.

### Server Library

The Server Library is used to communicate with the Syncano Cloud OS. The scripts that use the Syncano Server library are on the server side. It’s the functionality that runs the code that is powering the Syncano Sockets and makes sure they are executed at blazing speed with the right environment and runtime.

In order to use the Syncano Server Library, simply include it in your server side scripts, like so:

```javascript
import server from '@syncano/core'

const { data } = server()
```
And then to handle the data:
```javascript
data.users
  .where('email', 'john.doe@example.com')
  .first()
  .then(user => {
    // ...
  })

```

See the [Server Lib Reference](/server-lib-reference/installation) for more information on how to use it.


### The Syncano Client Library

A very lightweight front-end library that was created to call the endpoints which expose the Syncano Core API endpoints. Configuration is amazingly simple. To use it, add these couple of line to your front end (js) code:

```javascript
<script src="//cdn.jsdelivr.net/syncano-client-js/latest/syncano-client.min.js"></script>
<script>
  import Syncano from ' @syncano/client';

  const s = new Syncano('MY_INSTANCE_NAME')

  s.get('my/endpoint')
</script>
```

### Socket Registry

We have a registry with plenty of ready to use components and backend blueprints, all created by the Syncano community. You can immediately start using them to compose your dedicated and customized backend. You can easily create your own building blocks should you need additional functionality.

#### Syncano Sockets

> One of core concepts of the Syncano platform is the standardised backend building blocks which we call Syncano Sockets.

A Syncano Socket has a clear purpose — whether it is sending an email, storing data, translating a text file, or analysing a web page. A Syncano Socket is defined in such a way that it can be connected to any other Socket, kinda the way LEGO works. Combining Syncano Sockets enables you to assemble tailor-made backends at lightning speed.

#### Public registry
The publicly available Syncano Sockets are listed in the Public Syncano Socket Registry, and licensed under the MIT license.

#### Private registry
If a particular backend function you need is not available in the Public Syncano Socket Registry, you can create your own Syncano Sockets. Your custom made Syncano Sockets are automatically put into your own private Socket Registry that only you and your team have access to. Publishing private Syncano Sockets to the Public Syncano Socket Registry, is as simple as removing the `private` flag with .


Ok, now go ahead and try our [Quickstart Guide](/getting-started/quickstart) to get the glimpse of what Syncano can do!
