# Installation

To start using Syncano with your project follow the steps:

## Install the Syncano CLI in your project

The `syncano-cli` is the main tool for setting up and managing your projects on the Syncano Platform. To install it, run:

```sh
$ npm install @syncano/cli --save-dev
```

## Sign up and create a project
Once the Syncano CLI is installed you need to sign up for an account. Run the following command in the root directory of your project:

```sh
$ npx s init
```

> `s` is an alias to `syncano-cli` - you can simply type `syncano-cli`
> e.g. `npx syncano-cli init`

You'll be asked for an `email` and `password` so that we can create an account for you.
You'll also be prompted for a project template. Choose the recommended `Hello World` template and press enter.

## Deploy your project

Now it's time to deploy your app to the cloud. To do this, run the following command:

```sh
npx s socket:deploy
```

## Ok, but What has just happened!?

You've just deployed you first Syncano backend. Now you can verify what kind of endpoints you can reach on the backend side:

```sh
npx s socket:list
```

Try to call endpoints using browser or any HTTP Client.

That's `it`! If you have any questions, join our [Spectrum community space](https://spectrum.chat/syncano). Happy coding!


# CLI Usage
<!-- usage -->
```sh-session
$ npm install -g @syncano/cli
$ syncano-cli COMMAND
running command...
$ syncano-cli (-v|--version|version)
@syncano/cli/0.15.0 darwin-x64 node-v11.3.0
$ syncano-cli --help [COMMAND]
USAGE
  $ syncano-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`syncano-cli attach`](#syncano-cli-attach)
* [`syncano-cli backup:create`](#syncano-cli-backupcreate)
* [`syncano-cli backup:delete [ID]`](#syncano-cli-backupdelete-id)
* [`syncano-cli backup:last`](#syncano-cli-backuplast)
* [`syncano-cli backup:list`](#syncano-cli-backuplist)
* [`syncano-cli help [COMMAND]`](#syncano-cli-help-command)
* [`syncano-cli hosting:add FOLDER`](#syncano-cli-hostingadd-folder)
* [`syncano-cli hosting:config HOSTINGNAME`](#syncano-cli-hostingconfig-hostingname)
* [`syncano-cli hosting:delete HOSTINGNAME`](#syncano-cli-hostingdelete-hostingname)
* [`syncano-cli hosting:files HOSTINGNAME`](#syncano-cli-hostingfiles-hostingname)
* [`syncano-cli hosting:list`](#syncano-cli-hostinglist)
* [`syncano-cli hosting:sync HOSTINGNAME`](#syncano-cli-hostingsync-hostingname)
* [`syncano-cli info`](#syncano-cli-info)
* [`syncano-cli init [INSTANCE]`](#syncano-cli-init-instance)
* [`syncano-cli instance:create INSTANCENAME [LOCATION]`](#syncano-cli-instancecreate-instancename-location)
* [`syncano-cli instance:delete INSTANCENAME`](#syncano-cli-instancedelete-instancename)
* [`syncano-cli instance:list`](#syncano-cli-instancelist)
* [`syncano-cli login`](#syncano-cli-login)
* [`syncano-cli logout`](#syncano-cli-logout)
* [`syncano-cli socket:call FULLENDPOINTNAME`](#syncano-cli-socketcall-fullendpointname)
* [`syncano-cli socket:compile SOCKETNAME`](#syncano-cli-socketcompile-socketname)
* [`syncano-cli socket:config:config SOCKETNAME`](#syncano-cli-socketconfigconfig-socketname)
* [`syncano-cli socket:config:set SOCKETNAME CONFIGOPTIONNAME CONFIGOPTIONVALUE`](#syncano-cli-socketconfigset-socketname-configoptionname-configoptionvalue)
* [`syncano-cli socket:config:show SOCKETNAME`](#syncano-cli-socketconfigshow-socketname)
* [`syncano-cli socket:create SOCKETNAME`](#syncano-cli-socketcreate-socketname)
* [`syncano-cli socket:deploy [SOCKETNAME]`](#syncano-cli-socketdeploy-socketname)
* [`syncano-cli socket:hot [SOCKETNAME]`](#syncano-cli-sockethot-socketname)
* [`syncano-cli socket:list [SOCKETNAME]`](#syncano-cli-socketlist-socketname)
* [`syncano-cli socket:trace INSTANCENAME`](#syncano-cli-sockettrace-instancename)
* [`syncano-cli socket:uninstall SOCKETNAME`](#syncano-cli-socketuninstall-socketname)
* [`syncano-cli sysinfo`](#syncano-cli-sysinfo)

## `syncano-cli attach`

Info about current project/instance/user etc.

```
USAGE
  $ syncano-cli attach

OPTIONS
  --create-instance=create-instance
  --instance=instance
```

_See code: [src/commands/attach.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/attach.ts)_

## `syncano-cli backup:create`

Create backup

```
USAGE
  $ syncano-cli backup:create
```

_See code: [src/commands/backup/create.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/backup/create.ts)_

## `syncano-cli backup:delete [ID]`

Delete backup

```
USAGE
  $ syncano-cli backup:delete [ID]

ARGUMENTS
  ID  Backup ID.

OPTIONS
  --all
```

_See code: [src/commands/backup/delete.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/backup/delete.ts)_

## `syncano-cli backup:last`

List last backup

```
USAGE
  $ syncano-cli backup:last
```

_See code: [src/commands/backup/last.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/backup/last.ts)_

## `syncano-cli backup:list`

List backups

```
USAGE
  $ syncano-cli backup:list
```

_See code: [src/commands/backup/list.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/backup/list.ts)_

## `syncano-cli help [COMMAND]`

display help for syncano-cli

```
USAGE
  $ syncano-cli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.4/src/commands/help.ts)_

## `syncano-cli hosting:add FOLDER`

Add hosting

```
USAGE
  $ syncano-cli hosting:add FOLDER

ARGUMENTS
  FOLDER  path to hosting folder

OPTIONS
  --browser-router-off
  --browser-router-on
  --cname=cname
  --dont-sync
  --name=name
  --sync
  --without-cname
```

_See code: [src/commands/hosting/add.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/hosting/add.ts)_

## `syncano-cli hosting:config HOSTINGNAME`

Configure hosting

```
USAGE
  $ syncano-cli hosting:config HOSTINGNAME

ARGUMENTS
  HOSTINGNAME  name of the hosting to list files from

OPTIONS
  -c, --cname=cname
  --[no-]browser-router
  --dont-sync
  --remove-cname=remove-cname
  --sync
```

_See code: [src/commands/hosting/config.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/hosting/config.ts)_

## `syncano-cli hosting:delete HOSTINGNAME`

Delete hosting

```
USAGE
  $ syncano-cli hosting:delete HOSTINGNAME

ARGUMENTS
  HOSTINGNAME  name of the hosting to delete
```

_See code: [src/commands/hosting/delete.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/hosting/delete.ts)_

## `syncano-cli hosting:files HOSTINGNAME`

List hostings files

```
USAGE
  $ syncano-cli hosting:files HOSTINGNAME

ARGUMENTS
  HOSTINGNAME  name of the hosting to list files from
```

_See code: [src/commands/hosting/files.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/hosting/files.ts)_

## `syncano-cli hosting:list`

List hostings

```
USAGE
  $ syncano-cli hosting:list
```

_See code: [src/commands/hosting/list.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/hosting/list.ts)_

## `syncano-cli hosting:sync HOSTINGNAME`

List hostings

```
USAGE
  $ syncano-cli hosting:sync HOSTINGNAME

ARGUMENTS
  HOSTINGNAME  name of the hosting to sync (all if not provided)

OPTIONS
  -d, --delete
```

_See code: [src/commands/hosting/sync.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/hosting/sync.ts)_

## `syncano-cli info`

Info about current project/instance/user etc.

```
USAGE
  $ syncano-cli info
```

_See code: [src/commands/info.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/info.ts)_

## `syncano-cli init [INSTANCE]`

Init Syncano instance

```
USAGE
  $ syncano-cli init [INSTANCE]

ARGUMENTS
  INSTANCE  Instance Name
```

_See code: [src/commands/init.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/init.ts)_

## `syncano-cli instance:create INSTANCENAME [LOCATION]`

Create new instance

```
USAGE
  $ syncano-cli instance:create INSTANCENAME [LOCATION]

ARGUMENTS
  INSTANCENAME  name of the instance
  LOCATION      [default: eu1] name of the location (possible options: us1, eu1)
```

_See code: [src/commands/instance/create.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/instance/create.ts)_

## `syncano-cli instance:delete INSTANCENAME`

Delete an instance

```
USAGE
  $ syncano-cli instance:delete INSTANCENAME

ARGUMENTS
  INSTANCENAME  name of the instance
```

_See code: [src/commands/instance/delete.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/instance/delete.ts)_

## `syncano-cli instance:list`

Delete an instance

```
USAGE
  $ syncano-cli instance:list
```

_See code: [src/commands/instance/list.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/instance/list.ts)_

## `syncano-cli login`

Login to your account

```
USAGE
  $ syncano-cli login
```

_See code: [src/commands/login.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/login.ts)_

## `syncano-cli logout`

Login to your account

```
USAGE
  $ syncano-cli logout
```

_See code: [src/commands/logout.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/logout.ts)_

## `syncano-cli socket:call FULLENDPOINTNAME`

Trace Socket calls

```
USAGE
  $ syncano-cli socket:call FULLENDPOINTNAME

ARGUMENTS
  FULLENDPOINTNAME  full endpoint name in format: <socket_name>/<endpoint_name>

OPTIONS
  --body-only
```

_See code: [src/commands/socket/call.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/socket/call.ts)_

## `syncano-cli socket:compile SOCKETNAME`

Trace Socket calls

```
USAGE
  $ syncano-cli socket:compile SOCKETNAME

ARGUMENTS
  SOCKETNAME  name of the Socket
```

_See code: [src/commands/socket/compile.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/socket/compile.ts)_

## `syncano-cli socket:config:config SOCKETNAME`

Configure Socket

```
USAGE
  $ syncano-cli socket:config:config SOCKETNAME

ARGUMENTS
  SOCKETNAME  name of the Socket

ALIASES
  $ syncano-cli socket:config
```

_See code: [src/commands/socket/config/config.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/socket/config/config.ts)_

## `syncano-cli socket:config:set SOCKETNAME CONFIGOPTIONNAME CONFIGOPTIONVALUE`

Configure Socket

```
USAGE
  $ syncano-cli socket:config:set SOCKETNAME CONFIGOPTIONNAME CONFIGOPTIONVALUE

ARGUMENTS
  SOCKETNAME         name of the Socket
  CONFIGOPTIONNAME   config option name
  CONFIGOPTIONVALUE  config option value
```

_See code: [src/commands/socket/config/set.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/socket/config/set.ts)_

## `syncano-cli socket:config:show SOCKETNAME`

Configure Socket

```
USAGE
  $ syncano-cli socket:config:show SOCKETNAME

ARGUMENTS
  SOCKETNAME  name of the Socket
```

_See code: [src/commands/socket/config/show.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/socket/config/show.ts)_

## `syncano-cli socket:create SOCKETNAME`

Create Socket

```
USAGE
  $ syncano-cli socket:create SOCKETNAME

ARGUMENTS
  SOCKETNAME  Socket name
```

_See code: [src/commands/socket/create.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/socket/create.ts)_

## `syncano-cli socket:deploy [SOCKETNAME]`

Create Socket

```
USAGE
  $ syncano-cli socket:deploy [SOCKETNAME]

ARGUMENTS
  SOCKETNAME  Socket name

OPTIONS
  --bail
  --create-instance=create-instance
  --parallel
```

_See code: [src/commands/socket/deploy.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/socket/deploy.ts)_

## `syncano-cli socket:hot [SOCKETNAME]`

Create Socket

```
USAGE
  $ syncano-cli socket:hot [SOCKETNAME]

ARGUMENTS
  SOCKETNAME  Socket name

OPTIONS
  --trace
```

_See code: [src/commands/socket/hot.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/socket/hot.ts)_

## `syncano-cli socket:list [SOCKETNAME]`

List the installed Sockets

```
USAGE
  $ syncano-cli socket:list [SOCKETNAME]

ARGUMENTS
  SOCKETNAME  name of the Socket (all if not provided)

OPTIONS
  -f, --full
```

_See code: [src/commands/socket/list.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/socket/list.ts)_

## `syncano-cli socket:trace INSTANCENAME`

Trace Socket calls

```
USAGE
  $ syncano-cli socket:trace INSTANCENAME

ARGUMENTS
  INSTANCENAME  name of the instance
```

_See code: [src/commands/socket/trace.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/socket/trace.ts)_

## `syncano-cli socket:uninstall SOCKETNAME`

Uninstall Socket

```
USAGE
  $ syncano-cli socket:uninstall SOCKETNAME

ARGUMENTS
  SOCKETNAME  name of the Socket
```

_See code: [src/commands/socket/uninstall.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/socket/uninstall.ts)_

## `syncano-cli sysinfo`

Sys info for debug purpose

```
USAGE
  $ syncano-cli sysinfo
```

_See code: [src/commands/sysinfo.ts](https://github.com/Syncano/syncano-node/blob/v0.15.0/src/commands/sysinfo.ts)_
<!-- commandsstop -->
