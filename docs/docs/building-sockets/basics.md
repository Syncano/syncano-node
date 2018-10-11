# Basics

This section is for you, if you:
1. Know the basics of [YAML Syntax](/building-sockets/yaml-syntax)
2. Downloaded and used the `syncano-cli`
3. Know what a `socket.yml` is
4. Know the difference between the Syncano Server and Syncano Client libraries

> Syncano Sockets is one of the core concepts of the Syncano platform. They are a standardised backend building blocks

A Syncano Socket has a clear purpose — whether it is sending an email, translating a text file, storing data or analysing a web page. A Syncano Socket is defined in such a way that it can be connected to any other Socket, kinda the way LEGO works. Combining Syncano Sockets enables you to assemble tailor-made backends at lightning speed.

You can think of Syncano Sockets as an [npm](https://www.npmjs.com/) for building your API. With `syncano-cli` you can search for Syncano Sockets and install them into the `syncano` local folder on your computer. In this case, the `syncano` folder would be an equivalent of the `node_modules` directory. Going further with the `npm` analogy, `syncano.yml` is somewhat similar to the `package.json` file. It stores info about necessary dependencies and configuration. Syncano Sockets are like single modules in the `node_modules` directory.

What differs Syncano Sockets from an npm workflow, is that you have more control over your configuration. Scripts that come with Sockets are not bundled and can be easily configured. Integration between `modules` (the Syncano Sockets) relies on events that they emit to the Syncano event loop. You can set listeners in the Syncano Sockets that will catch those events and execute an appropriate Socket. More on that in the sections below.

## Syncano Socket File Structure

Syncano Sockets are represented by folders that are located in the `/syncano/` directory of your project. A typical Socket directory structure will look like this:

```
hello
├── bin
│   └──compile
│   └──compile-env
├── package.json
├── src
│   └── hello.js
└── socket.yml
```

> .dist folder
>
> When you run `npx syncano-cli deploy` command, one additional folder will be created:
> - .dist - contains zipped socket.yml files. syncano-cli is using these files to update your Instance configuration.

## Creating a Syncano Socket

```sh
npx s create <name>
```

Example:
```sh
npx s create hello-world
```
Later, you will be asked to choose the template:

```
?   Choose template for your Socket (Use arrow keys)
      Vanilla JS Socket - (@syncano/template-socket-vanilla)
❯     ES6 Socket - (@syncano/template-socket-es6)


Your Socket configuration is stored at /Users/qk/my_project/syncano/hello-world
```

Now you can check if it was installed correctly, by typing:

```sh
npx s list hello-world
```

```yaml
name: hello-world

endpoints:
  hello:
    description: Hello world!
    inputs:
      properties:
        firstname:
          type: string
          description: First name of the person you want to greet
          examples:
            - Tyler
        lastname:
          type: string
          description: Last name of the person you want to greet
          examples:
            - Durden
    outputs:
      success:
        description: Success
        properties:
          message:
            description: Hello message
        examples:
          - |
            {
              "message": "Hello Tyler Durden!"
            }
      fail:
        exit_code: 400
        description: Failed
        properties:
          message:
            description: Error message

        examples:
          - |
            {
              "message": "You have to send "firstname" and "lastname" arguments!"
            }
```

Currently it has `not synced` status which means you should deploy this Socket before using it in your app.

## Syncano Socket Deployment

To deploy a socket type:

```sh
npx syncano-cli deploy hello-world
```
```
    socket synced: 17:10:06 hello-world 3943 ms
```

## Syncano Socket Hot Deployment

You can use a hot deployment feature which watches your socket's files and deploys it on change (you need to deploy your socket first in order to use this feature). If no socket name is provided it watches all of your sockets.

```sh
npx s hot <socketname>
```
```
  🔥  Hot deploy started (Hit Ctrl-C to stop)

     project synced: 15:25:48 1 ms

```
