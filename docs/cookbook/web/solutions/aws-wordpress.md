# AWS S3 Wordpress

- Preparation: **1 minute**
- Requirements:
  - Initiated Syncano project
  - config with [aws-config](/solutions/aws-config)
- Sockets:
  - [aws-wordpress](https://syncano.io/#/sockets/aws-wordpress)

### Problem to Solve

Configuring, and setting up WordPress on a dedicated virtual private server can take a lot of time and effort.

### Solution

This socket enables quick and effortless configuration of a WordPress service with an Amazon Lightsail instance.


## Installing dependencies

If you haven't done that already, please [configure](/solutions/aws-config) your Syncano instance.

To install `aws-wordpress` type:
```sh
$ npx s add aws-wordpress
$ npx s deploy
```

## Done!

Call the create-ls-instance endpoint
```sh
$ npx s call aws-wordpress/create-ls-instance
```

## Testing functionality

Now you can login to your WordPress instance and start creating your fabulous WordpPress service.
