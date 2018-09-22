# Overview
With Sockets you can create a sophisticated backend using reusable building blocks called `Syncano Sockets` without leaving your favourite development environment.

Main terms:
 - `Instance` - space on the **Syncano Cloud Platform** created for the project
 - `Sockets` - Syncano building blocks
 - `Syncano CLI` - command line tool used to configure and deploy backend

## Initiate

When project is locally initiated it is ready to deploy it to Syncano Platform.
During the initiation `syncano-cli` will create structure of configuration files.
Those configuration files can be committed to the repository (e.g. `git`) so you
will have full control over development process of you backend.

## Project structure

If you will choose `hello` template, this file structure will be created:

```
my-project/
my_project/syncano.yml
my-project/.gitignore
my-project/syncano/hello
my_project/syncano/hello/socket.yml
my-project/syncano/hello/package.json
my-project/syncano/hello/src/hello.js
my-project/syncano/hello/bin/compile
my-project/syncano/hello/bin/compile-env
```

Main `project` files:
- `my_project/syncano.yml` - main Syncano configuration file of your project
- `my-project/syncano` - folder where Syncano sockets are stored

`hello` Socket files:
- `my-project/syncano/hello` - folder where all the `hello` Socket files are stored
- `my-project/syncano/hello/src` - folder where all the `hello` Socket script files are stored
- `my_project/syncano/hello/bin` - `hello` Socket build scripts
- `my_project/syncano/hello/socket.yml` - `hello` Socket configuration file
- `my-project/syncano/hello/package.json` - `hello` Socket `package.json`, here you can add
  dependencies of the `hello` Socket
