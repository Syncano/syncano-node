## Basics

### init

To start the Syncano project use:
```sh
syncano-cli init
```

What will happen?
- Syncano Instance will be created
- local files structure will be created (using chosen template)

If you have an Instance already, you can initiate project using it, instead of creating it:
```sh
syncano-cli init -i <existing_instance_name>
```

### attach

To attach project from the current folder the Syncano Instance use:
```sh
syncano-cli attach
```

What will happen?
- You will be asked to choose the Instance you want to use for your project

You can also use flag:
```sh
syncano-cli attach --instance <instance_name>
```

### login
```sh
syncano-cli login
```
Provide login and password of your account to log you in.

### logout
```sh
syncano-cli logout
```
Your account keys will be removed from your machine.

## Project

### hot

Hot deploy to make your project continuously synced to the Syncano cloud:
```sh
syncano-cli hot
```
> `syncano-cli hot` is an alias to `syncano-cli deploy --hot --trace`

It compiles and deploys all global configuration and Syncano Sockets in your project right away.

### deploy

To deploy your backend execute:
```sh
syncano-cli deploy
```
It compiles and deploys all global configuration and Syncano Sockets in your project. From now on, you can call every endpoint from every Socket in your project. Dependencies will be also deployed in that process.

I you don't have instance for that project yet, you can create it during `deploy` process:
```sh
syncano-cli deploy --create-instance <my new instance>
```

#### Deploy single Socket

To deploy single Socket provide socket name as an additional argument:
```sh
syncano-cli deploy <socket_name>
```

#### Hot deploy
When you are developing your Socket you probably do not want to deploy it manually every time you make a change. To make it more efficient, you can use `--hot` flag to track changes in your Socket scripts and configuration. Every time you change something, it will be deployed automatically.

```sh
syncano-cli deploy --hot
syncano-cli deploy <socket_name> --hot
```

In `hot` deploy mode you can also use `trace`:
```sh
syncano-cli deploy --hot --trace
syncano-cli deploy <socket_name> --hot --trace
```

### call
You can test your Socket by calling it:
```sh
syncano-cli call <socket_name>/<endpoint>
```
If your Socket has any parameters, you will be asked about them. Next, you will get a response from your script.
You can also call your Socket's endpoint by making a HTTP request to an URL that you can find by running `syncano-cli list <socket_name>`.

### trace
You can trace your Socket call by using:
```sh
syncano-cli trace [socket_name]
```

If you will not provide any particular Socket name, all the socket will be traced.

## Sockets

### list

To list all your Syncano Sockets:
```sh
syncano-cli list
```
Example response:
```
socket: hello
description: Hello World Socket
status: synced

    endpoint: hello/hello
    description: Hello world!
    url: https://<instance_name>.syncano.space/hello/hello/
```
`list` without any arguments will show you only list of Socket with `endpoints`, `event handlers` and `events` (without parameters).

#### Detailed list
To get list with all details use:

```sh
sycano-cli list -f
sycano-cli list --full
```

#### List single Socket
To list single Socket (detailed list by default)
```sh
sycano-cli list <socket_name>
```
Example:
```
socket: hello
description: Test Socket

     endpoint: test/hello
  description: Hello world!
         path: https://morning-wood-4770.syncano.space/test/hello/

      parameters:

            name: lastname
     description: Last name of the person you want to greet
         example: Durden

            name: firstname
     description: First name of the person you want to greet
         example: Tyler

        response: text/plain

     description: Success
        exit code: 200
         example: Hello Tyler Durden!

     description: Failed
       exit code: 400
         example: No first name or last name provided :(
```

### add
```sh
syncano-cli add <name>
```
This command allows you to `add` a Syncano Socket from the Syncano Registry. It's a place where Syncano Sockets made by other developers are stored, so that you can use them in your own project. Some Sockets need a configuration (e.g. API keys, usernames etc.) - you will be asked to provide configuration options during `deploy`.

#### Passing configuration as environment variables

You can export configuration options as a variables using this syntax:
```sh
export <SOCKET-NAME>_<OPTION-NAME>=<VALUE>
```

For example:
```sh
export TWITTER_API_KEY=324hgkjg234gdh23d4jh2df34
export ANALYTICS_API_KEY=78jkh634gs23jf234jgfk234
```

You will not be asked to provide values for config options if it will be set in your environment.

### create
To create a Socket execute:
```sh
syncano-cli create <name>
```

Example:
```sh
syncano-cli create my_new_socket
```

You will be asked to choose a template:
```
?   Choose template for your Socket
❯     empty - Empty Socket
      example - Example Socket with one mocked endpoint (recommended)

Your Socket configuration is stored at /Users/qk/my_project/syncano/my_new_socket
```
If you are interested in creating your [Socket templates](advanced.md#socket-templates).

After that you can start working with your new Socket. Currently it has got 'not synced' status which means you should deploy this socket to server before using it.

### config

To configure a given Socket use:
```sh
syncano-cli config <socket_name>
```

### config-set

To configure chosen option of a given Socket use:
```sh
syncano-cli config-set <socket_name> <option_name> <value>
```

### config-show

To preview configuration options of a given Socket use:
```sh
syncano-cli config-show <socket_name>
```

### remove

To remove the Syncano Socket from your configuration
```sh
syncano-cli remove <socket_name>
```
This command deletes your Socket only from local config. To apply changes you have to deploy your configuration.

## Registry

### search
```sh
syncano-cli search <keyword>
```
Sockets will be searched by name, description and tags, so you will find Sockets matching only your search term. When you find a Syncano Socket that interests you, you use its name to install it.

### info (coming soon)
Use Socket name and `info` command to print detailed information about it (from the Sockets Registry):
```sh
syncano-cli info <socket_name>
```

### submit

If you want to submit your Socket to the `Syncano Sockets Registry` use:
```sh
syncano-cli submit <socket_name>
```
Where the `<socket_name>` is the name of your Socket available locally.

!> By default, the submitted Syncano Socket is private (available only for you).

### publish

Publishing Socket mean to make it available for everyone. To do it use:
```sh
syncano-cli publish <socket_name>
```
Where the `<socket_name>` is the name of your Socket you already submitted to the Registry. You cannot reverse this action.

## Hosting

### add
```sh
syncano-cli hosting add [hosting_path]
```
Later, you will be asked to provide some info:
* Please choose for which socket you want to list hostings
* Please name this hosting
* Please choose directory of your files **(this one appears if you don't specify [hosting_path])**
* Do you want to set CNAME now (your own domain) or should it be empty?

After proceeding with these prompts, hosting will be added to your configuration in `syncano.yml` hosting section. You have to `deploy` configuration after that operation.

### config

Thanks to the `config` command you can configure CNAME for the given hosting:
```sh
syncano-cli config <hosting_name> --cname <your_domain>
```

### sync
To synchronize all the hosting files execute:
```sh
syncano-cli hosting sync
```
After running this command all the hosting files will be uploaded to the server. You can find all of them in URL printed after successful synchronization.

Example:
```
    Syncing hosting files for staging
    https://<hosting_name>--<instance_name>.syncano.site

      ✓ File added:   index.html

    1 files synchronized, 339 B in total
    staging is available at: https://<hosting_name>--<instance_name>.syncano.site
```


!> Files which are not available locally anymore will be also deleted from the server.

#### Synchronizing files of specific Hosting
```sh
syncano-cli hosting sync <hosting-name>
```

### list
To list Hosting configuration:
```sh
syncano-cli hosting list
syncano-cli hosting list <hosting-name>
```

Example response:
```
    Your Hosting containers:

    name: hello
    url: https://<hosting_name>--<instance_name>.syncano.site
```

### list files
```sh
syncano-cli hosting files <hosting-name>
```
Example response:
```
    Hosting staging has 3 files:

    path                                          size     uploaded      up to date
    index.html                                    29 B            ✓              ✓
    js/index.js                                  364 B            ✓              ✓

    You have 2 files, 394 B in total.
```

### delete
To delete Hosting configuration:
```sh
syncano-cli hosting delete <hosting-name>
```
!> After that your Hosting will be deleted from the configuration but folder with files will still be available in your local directory.
Hosting will be removed from your backend during the next `syncano-cli deploy`.
