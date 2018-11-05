# Using multiple Syncano accounts

* Preparation time: **1 minute**
* Requirements:
  - Initiated Syncano project

### Problem to solve

Let's say that you have more than one Syncano account and you want to use different accounts for different projects you are working with.

### Solution

The solution is to can set environment variables when you working with particular project.

### Setting up account and instance

Every process has an environment block that contains a set of environment variables and their values. 

- *SYNCANO_PROJECT_INSTANCE* - name of the instance you want to use for that project
- *SYNCANO_AUTH_KEY* - API key of the account you want to use to access that instance

### How it works?

For example:

```sh
export SYNCANO_PROJECT_INSTANCE=bitter-sound-5197
export SYNCANO_AUTH_KEY=89ba24a2a0f3dc8dfa4807701319a327728cdc44
```

You can also automate that task by using `direnv` (https://direnv.net/) tool. Install `direnv` and create `.envrc` file, e.g.:

```sh
export SYNCANO_PROJECT_INSTANCE=bitter-sound-5197
export SYNCANO_AUTH_KEY=89ba24a2a0f3dc8dfa4807701319a327728cdc44
```

!> Remember to protect this file! Do not add it to repository!
