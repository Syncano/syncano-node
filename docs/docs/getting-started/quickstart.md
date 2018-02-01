# Quickstart Guide

A small teaser of what you will have build in a couple of minutes from now:

![Teaser](http://i.imgur.com/XAxBGof.gif)

Tutorial steps:
1. Cloning an example repository with a simple front-end project (a chat app)
2. Syncano CLI installation
3. Signing up and creating a Syncano project
4. Adding a Syncano Socket
5. Configuring the front-end
6. Hosting your application on Syncano

> You can test the app live at this url: https://production--chat-app.syncano.site/

# Clone the example repository

First git clone the sample Chat project by going to your terminal application and running:

```sh
git clone https://github.com/Syncano-Community/chat-app.git
cd chat-app/
```

# Install the Syncano CLI

> **In order to use the Syncano CLI you will have to install the following dependencies:**
* NodeJS greater than [![NODE](https://img.shields.io/badge/node-v8.9.0-blue.svg)](http://nodejs.org/)
* NPM greater than [![NPM](https://img.shields.io/badge/npm-v8.9.0-blue.svg)](http://npmjs.com/) 

The `syncano-cli` is the main tool for setting up and managing your projects on the Syncano Platform. To install it, run:

```sh
npm install @syncano/cli
``` 

# Sign up and create a project
Once the Syncano CLI is installed you can sign up for an account. Run the following command in the root directory of your project:

```sh
npx syncano-cli init
```

> There's shortcut for `syncano-cli` - you can simple type `s`
> * `npx s init`

You'll be asked for an `email` and `password` so that we can create an account for you.
You'll also be prompted for a project template. Choose the recommended `Hello World` template and press enter.

![syncano-cli init](/img/syncano-cli-init.png)

# Install a Syncano Socket

Now, we will install the `chat` socket from the `Syncano Registry`.

> The Syncano Sockets are backend modules that enclose a piece of functionality needed for your app. The difference is, that instead of functions they expose endpoints for communication with the server, and emit events so that integrations with other Syncano Sockets are possible. You can find out more about the Sockets concept in the Sockets Overview section.

```sh
npx syncano-cli add chat
```
![syncano-cli install chat](/img/syncano-cli-add-chat.png)

This command will add a `chat` Socket as a dependency of your project. It has everything that is needed for your chat application front-end to work. By now your `chat-app` project structure should look like this:

![chat-project-structure](/img/chat-project-structure.png)

> Run `npx syncano-cli list chat` to view the Socket documentation

To make sure it has been added correctly, you can open the `chat-app/syncano/syncano.yml` and see if these lines are present:
> The chat app Socket you installed may have a higher version number

```yml
dependencies:
  sockets:
    chat:
      version: 0.0.1
```

# Configure your front-end

The only change you need to make in the code is in the `web/index.html` file. Open it and replace the `INSTANCE_NAME` with your `Instance` name in the 8th line:

![Change instance name](/img/syncano-cli-index.png)

 > To find out your Instance name you can run `syncano-cli` command. It will be printed as a `Current Instance`.

# Deploy your project

Now it's time to deploy your app to the cloud. To do this, run the following command:

```sh
npx syncano-cli hosting add web/
```
![Add hosting](/img/syncano-cli-hosting-add.png)

Choose the defaults when prompted and type `y` and press enter when asked `Do you want to sync files now?`

Your web assets will be published under the url printed by the Syncano CLI. It should have this format:  `https://staging--<instance name>.syncano.site`. Go to this url to see the published project. Open the url in two tabs to experience the realtime in action.

# Ok, but What has just happened!?

You have successfully configured and deployed a full stack, realtime, scalable chat application. Well done!

How did it happen? Here's a quick rundown:

1. When running `syncano-cli add chat` you have connected to `Syncano Registry` which contains components created by the community that you can integrate into your app. You can run `syncano-cli search [term]` to discover more Sockets.
2. The `chat` Socket was added as a dependency in the `syncano.yml` file. All the dependencies installed from the `Syncano Registry` will be present in this file
3. By providing the `instance_name` in the `index.html` you simply configure your web app to use your own Syncano API. The `Syncano Client` library handles the rest.
4. `syncano-cli hosting add web/` is the last command. It publishes your static web assets from the `web` folder and hosts them on Syncano.

That's `it`! If you have any questions, log into our [Slack](https://syncano.io/#/slack-invite) and chat with the community. Happy coding!
