# Overview
<img style="margin-left: 50px; float: right" src="img/instance.png" width="200">

With Sockets you can create a sophisticated backend using reusable building blocks called `Syncano Sockets` without leaving your favorite development environment.

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
my-project/.gitignore
my-project/syncano
my-project/syncano/hello
my-project/syncano/hello/package.json
my-project/syncano/hello/src
my-project/syncano/hello/src/hello.js
my_project/syncano/hello/socket.yml
my_project/syncano/package.json
my_project/syncano/syncano.yml
```

Main `project` files:

- `my-project/syncano` - folder where all the Syncano related files are stored
- `my_project/syncano/syncano.yml` - main Syncano configuration file of your project
- `my_project/syncano/package.json` - `package.json` for the whole project,
   here you can add dependencies of you project directly from `npm` in traditional way

`hello` Socket files:
- `my-project/syncano/hello` - folder where all the `hello` Socket files are stored
- `my_project/syncano/hello/socket.yml` - `hello` Socket configuration file
- `my-project/syncano/hello/package.json` - `hello` Socket `package.json`, here you can add
  dependencies of the `hello` Socket
