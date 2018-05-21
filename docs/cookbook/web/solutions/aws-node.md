# AWS NodeJS

- Preparation: **1 minute**
- Requirements:
  - Initiated Syncano project
  - config with [aws-config](/solutions/aws-config)
- Sockets:
  - [aws-node](https://syncano.io/#/sockets/aws-node)

### Problem to Solve

Configuring, and setting up NodeJS on a dedicated virtual private server can take a lot of time and effort.

### Solution

This socket enables quick and effortless configuration of NodeJS with an Amazon Lightsail instance.

## Installing dependencies

If you haven't done that already, please [configure](/solutions/aws-config) your Syncano instance

To install `aws-node` type:
```sh
$ npx s add aws-node
$ npx s deploy
```

## Done!

To create a NodeJS server on AWS Lightsail, call the create-ls-instance endpoint

```sh
$ npx s call aws-node/create-ls-instance
```

## Testing functionality

Now you can start creating your NodeJS application.
