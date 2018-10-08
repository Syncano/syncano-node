[![CircleCI](https://circleci.com/gh/Syncano/syncano-node-cli/tree/devel.svg?style=shield&circle-token=75b1f0b2fdd5e4a51ccf4506568ca505cccd28e3)](https://circleci.com/gh/Syncano/syncano-node-cli/tree/devel)  [![PRs](https://img.shields.io/badge/PRs-yes-orange.svg)](CONTRIBUTING.md) [![codecov](https://codecov.io/gh/Syncano/syncano-node-cli/branch/devel/graph/badge.svg?token=HDMlBF4FkF)](https://codecov.io/gh/Syncano/syncano-node-cli)
[![NODE](https://img.shields.io/badge/node-v4.6.7-blue.svg)](http://nodejs.org/)

# Installing the Syncano CLI

```sh 
npm install  @syncano/cli
```

Now you can use `npx syncano-cli`:

```sh
npx syncano-cli
```
```
  Usage: syncano-cli [options] [command] 

  Current Instance: your-instance-1234

  Basics:

    init [options]       Start a Syncano project in the current directory
    attach [options]     Attach project to the chosen Instance
    login                Login to your account
    logout               Logout from your current account

  Project:

    hot [socket_name]                          Hot deploy to make your project continuously synced to the Syncano cloud
    deploy [options] [socket_name]             Synchronize your project to Syncano
    call [options] <socket_name>/<endpoint>    Call Socket's endpoint
    trace [socket_name]                        Trace Socket calls

  Sockets:

    list [options] [socket_name]                      List the installed Sockets
    add [options] <socket_name>                       Add a Socket as a dependency of your project or local Socket
    remove <socket_name>                              Remove a Socket from your project
    create <socket_name>                              Create a new Socket for your project
    config <socket_name>                              Configure a given Socket
    config-set <socket_name> <option_name> <value>    Configure a config option of a given Socket
    config-show <socket_name>                         Show config options of a Socket

  Other:

    hosting       Manage your web assets and host them on Syncano
    component     Manage your Socket components

  Options:

    -V, --version  output the version number
    -h, --help     output usage information
```

Go and check documentation for all the [commands](cli-reference/commands).
