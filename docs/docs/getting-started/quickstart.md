# Quickstart Guide

To start using Syncano with your project follow the steps:

## Install the Syncano CLI in your project

The `syncano-cli` is the main tool for setting up and managing your projects on the Syncano Platform. To install it, run:

```sh
npm install @syncano/cli --save-dev
```

## Sign up and create a project
Once the Syncano CLI is installed you can sign up for an account. Run the following command in the root directory of your project:

```sh
npx s init
```

> `s` is an alias to `syncano-cli` - you can simply type `syncano-cli`
> e.g. `npx syncano-cli init`

You'll be asked for an `email` and `password` so that we can create an account for you.
You'll also be prompted for a project template. Choose the recommended `Hello World` template and press enter.

## Deploy your project

Now it's time to deploy your app to the cloud. To do this, run the following command:

```sh
npx s deploy
```

## Ok, but What has just happened!?

You've just deployed you first Syncano backend. Now you can verify what kind of endpoints you can reach on the backend side:

```sh
npx s list
```

Try to call endpoints using browser or any HTTP Client.

That's `it`! If you have any questions, log into our [Slack](https://syncano.io/#/slack-invite) and chat with the community. Happy coding!
