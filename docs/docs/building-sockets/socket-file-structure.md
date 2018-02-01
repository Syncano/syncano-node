# Sockets File Structure

## Intro
You can think of Syncano Sockets as an [npm](https://www.npmjs.com/) for building your API. With `syncano-cli` you can search for Syncano Sockets and install them into the `syncano` folder. In this case, the `syncano` folder would be an equivalent of `node_modules` directory. Going further with the `npm` analogy, `syncano.yml` is somewhat similar to the `package.json` file. It stores info about necessary dependencies and configuration. Sockets are like single modules in the `node_modules` directory.

What differs Syncano Sockets from an npm workflow, is that you have more control over your configuration. Scripts that come with Sockets are not bundled and can be easily configured. Integration between `modules` relies on events that they emit. You can set listeners that will catch those events and execute an appropriate Socket. More on that in the sections below.

## File structure
When you do a `npx syncano-cli init` from the Syncano CLI, a `syncano` folder will be created in your current directory. It has a following structure:

![File structure](building-sockets/syncano-socket-structure.png)

|File or Direcotry|Description|
|---|---|
|syncano.yml|This file contains an Instance configuration. It lists Instance variables and plugins used by the CLI. It's in the root of `syncano` directory.|
|package.json|You can use `npm` packages within your Syncano scripts. `npm i <package> --save-dev` and require them as you would in a regular project.|
|`/socket/` directory|Each socket installed in your Instance will have its own directory. It will contain:|
|`/scripts/`directory|Will contain all the scripts that are executed by endpoints defined in the `socket.yml` file|
|socket.yml|Socket configuration file. It contains socket specific information like:<br/>-endpoints definitions<br/>-class schema configuration<br/>-hosting configuration|


> .dist folders

> When you run `npx syncano-cli deploy` command, two system folders will be created by syncano-cli:
- .dist - contains zipped socket.yml files. syncano-cli is using these files to update your Instance configuration.
