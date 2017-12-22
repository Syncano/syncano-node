# Contributing to Syncano

- [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device.
- Install `lerna` as global dependency: `yarn global add lerna`
- Install project dependencies: `lerna bootstrap`
- Check contributing.md of package you want to contribute in.
  - [Syncano CLI](packages/cli/contributing.md)
  - [Syncano Core Library](packages/lib-js-core/contributing.md)
  - [Syncano Client Library](packages/lib-js-client/contributing.md)

## Verifying Circle CI config

You can validate Circle CI config file by running `yarn run validate:circleci`.
Circle CI command line interface (CLI) is a requirement, please follow this instruction to install it in your system:
https://circleci.com/docs/2.0/local-jobs/#circleci-command-line-interface-cli-overview
