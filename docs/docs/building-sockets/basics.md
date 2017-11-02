# Basics

This section is for you, if you:
1. Know the basics of [YAML Syntax](/building-sockets/yaml-syntax)
2. Downloaded and used the `syncano-cli`
3. Know what a `socket.yml` is
4. Know the difference between the Syncano Server and Syncano Client libraries


> Syncano Sockets is one of the core concepts of the Syncano platform. They are a standardised backend building blocks

A Syncano Socket has a clear purpose — whether it is sending an email, translating a text file, storing data or analysing a web page. A Syncano Socket is defined in such a way that it can be connected to any other Socket, kinda the way LEGO works. Combining Syncano Sockets enables you to assemble tailor-made backends at lightning speed.

You can think of Syncano Sockets as an [npm](https://www.npmjs.com/) for building your API. With `syncano-cli` you can search for Syncano Sockets and install them into the `syncano` local folder on your computer. In this case, the `syncano` folder would be an equivalent of the `node_modules` directory. Going further with the `npm` analogy, `syncano.yml` is somewhat similar to the `package.json` file. It stores info about necessary dependencies and configuration. Syncano Sockets are like single modules in the `node_modules` directory.

What differs Syncano Sockets from an npm workflow, is that you have more control over your configuration. Scripts that come with Sockets are not bundled and can be easily configured. Integration between `modules` (the Syncano Sockets) relies on events that they emit to the Syncano eventloop. You can set listeners in the Syncano Sockets that will catch those events and execute an appropriate Socket. More on that in the sections below.

## Syncano Socket Structure

Syncano Sockets are represented by folders that are located in the `/syncano/` directory of your project. A typical Socket directory structure will look like this:

```
syncano
├── hello
│   ├── package.json
│   ├── scripts
│   │   └── hello.js
│   └── socket.yml
└── syncano.yml
```

> .dist & .bundles folders
>
> When you run `syncano-cli deploy` command, two system folders will be created:
> - .dist - contains zipped socket.yml files. syncano-cli is using these files to update your Instance configuration.
> - .bundles - syncano-cli bundles the scripts with their dependencies before syncing them with your Instance. This is the folder where those scripts are being held.

## Creating a Syncano Socket

```sh
syncano-cli create <name>
```

Example:
```sh
syncano-cli create hello-world
```
Later, you will be asked to choose the template:

```
?   Choose template for your Socket (Use arrow keys)
      empty - Empty Socket
❯     example - Example Socket with one mocked endpoint (recommended)

Your Socket configuration is stored at /Users/qk/my_project/syncano/hello-world
```

Now you can check if it was installed correctly, by typing:

```sh
syncano-cli list hello-world
```

```yaml
socket: hello-world
description: Description of hello-world
status: not synced

    endpoint: hello-world/hello
    description: Hello world!
    url: https://rough-dew-3551.syncano.link/hello-world/hello/
    status: not synced

        params:

        name: firstname
        description: First name of the person you want to greet
        example: Tyler

        name: lastname
        description: Last name of the person you want to greet
        example: Durden

        response: text/plain

        description: Success
        exit code: 200
        example:
        Hello Tyler Durden!

        description: Failed
        exit code: 400
        example:
        No first name or last name provided :(
```

Currently it has `not synced` status which means you should sync this Socket before using it in your app.
To sync type:

```sh
syncano-cli deploy hello-world
```
```
    socket synced: 17:10:06 hello-world 3943 ms
```
