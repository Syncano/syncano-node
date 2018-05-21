# AWS Ethereum

- Preparation: **1 minute**
- Requirements:
  - Initiated Syncano project
  - config with [aws-config](/solutions/aws-config)
- Sockets:
  - [aws-ethereum](https://syncano.io/#/sockets/aws-ethereum)


### Problem to Solve

Configuring, and setting up an Ethereum network can take a lot of time and effort.


### Solution

This socket launches an Ethereum network on an Amazon ECS cluster or an Amazon EC2 instance. It also deploys additional required components.

## Installing dependencies

If you haven't done that already, please [configure](/solutions/aws-config) your Syncano instance

To install `aws-ethereum` type:

```sh
$ npx s add aws-ethereum
$ npx s deploy
```

## Testing functionality

Now you can start creating your fabulous dApp on Ethereum blockchain. For additional info, see:
- AWS docs for more on [instance configuration](https://docs.aws.amazon.com/blockchain-templates/latest/developerguide/blockchain-templates-ethereum.html)
- Docs of the latest [Ethereum](http://www.ethdocs.org/en/latest/) release
