## AWS Configuration

- Preparation: **2 minutes**
- Requirements:
  - Initiated Syncano project
  - AWS ACCOUNT_KEY
  - AWS SECRET
- Sockets:
  - [aws-config](https://syncano.io/#/sockets/aws-config)

## Problem

To configure an AWS service, you'll need to provide `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `REGION`.

## Solution

This Socket provides a configuration endpoint and can is a base for the following AWS sockets: `aws-storage`, `aws-wordpress`, `aws-node`, `aws-ethereum` and `aws-ls`

## Installing dependencies

To install `aws-config` type:
```sh
$ npx s add aws-config
$ npx s deploy
```

Now you have to provide ACCOUNT_KEY and SECRET key for the AWS Service:
```sh
$ npx s call aws-config/install
```

#### AWS_ACCESS_KEY_ID
An access key to your AWS account.

#### AWS_SECRET_ACCESS_KEY
A secret key to your AWS account.

#### REGION
A region on which your instance will operate.

To take advantage of a configured AWS account, see the [aws-storage](https://syncano.io/#/sockets/aws-storage) Socket that communicates with S3 and makes it super easy to use this service.
