# How to Contribute

Syncano CLI welcomes contributions in form of pull requests, as main purpose of open sourcing is to make it better and easier to use.
We also want to give our community a way to be a part of this project and create features they actually want.


## Reporting Bugs

### Known Issues

Please check our [GitHub Issues](https://github.com/Syncano/syncano-node-cli/issues) as this is the main place for reported bugs.
If the same type of bug affects you, just add your information to already existing one.

### New Issues

Before creating new issues, check [Known Issues](https://github.com/Syncano/syncano-node-cli/issues).
If it's a new bug add it to our issues, with additional data, like your node/npm/yarn version, OS or snippet of code.


## Contact

  * Slack: https://syncano.io/#/slack-invite
  * Email: [support@syncano.com](mailto:support@syncano.com)


## Testing

#### End-to-end
To be able to run end-to-end tests set those environment variables:

```sh
# set test mode
export NODE_ENV="test"

# if you want to see verbose output from the tests (optional)
export SYNCANO_E2E_DEBUG

# to have separate account file for the testing purposes (recommended)
export SYNCANO_ACCOUNT_FILE=syncano-test

# to have separate account file for the testing purposes
export E2E_CLI_EMAIL="<your test account email>"
export E2E_CLI_PASSWORD="<your test account password>"
export E2E_CLI_ACCOUNT_KEY="<your test account account key>"
export E2E_CLI_TEMP_EMAIL="syncano.bot@syncano.com"
```

To run a test use:

```sh
# Run basic set of the e2e tests
npm run e2e

# Run single tutorial
npm run e2e:tutorial -- src/tests/e2e/tutorials/quickstart.test-e2e.js
```

## Pull requests

#### Prerequisites

  * You have `node` v7.0.0+ installed and `yarn` at v0.17.10+ (as we use it for development)
  * You are familiar with `npm`/`yarn`
  * You are familiar with `git`, `github` and proper branching flow
  * You know how to set `ENV` variables on your OS
  * You know `JavaScript`

#### Before you submit a pull request

  * Fork our repository and create a branch from `devel`
  * If you have added or changed existing code, add `unit tests`!
  * If you have changed the way `CLI` works, update `README.md`
  * If you have changed/bumped package update and commit `yarn.lock`
  * Ensure that all `unit tests` passes (`yarn test`)
  * Check that your code lints (`yarn lint`/`yarn lint-tests`)
  * Check that your code passes all tests on `CI`

#### Branching flow

We branch our work from `devel`.
After merging your changes, they (changes) will wait for our `devel` tests to pass and then automatically merged into `beta` branch.
It will be submitted to npm with `@beta` tag. From there we will merge it into `master` that will bump proper version of `CLI`.

#### Waiting for review

Our team is keeping an eye on pull requests.
We will review your pull requests as soon as possible.
Next, we will give you feedback and either request changes, merge or close it.


## Style guide

  * Use `es6` syntax
  * Use semicolons `;`
  * 2 space indention (no tabs)
  * Prefer `'` over `"`
  * Prefer template strings
  * 120 character length limit
  * Do not use `console.log`, etc in code (expect debugging locally)
  * Always add exact versions of packages `3.2.0` instead of `^3.2.0`


## Committing

We use [commitizen](https://github.com/commitizen/cz-cli) as a tool that helps us write meaningful commit messages.

To use it, run the following command **instead** of `git commit`:
```sh
npm run commit
```
Follow the prompt questions with these guidelines:

#### 1. Change type

As prompted

#### 2. Change scope

Scope examples: `commands`, `constants`, `program`, `settings`, `utils`, `release`, `templates`, `configuration`, `ci`, `tests`

#### 3. Short description

For community contributors - GitHub issue id and title, for example:

`#123 syncano-cli list command doesn't list remote sockets`

For in-house developers - id and title of JIRA issue, for example:

`[CLI-123] Update all prompts and command descriptions`

#### 4. Long description (optional)

Longer explanation of an issue.

#### 5. Breaking changes (optional)

Breaking change is a one that introduces backwards incompatibility.
If a commit changes how users would interact with an already existing interface, then it's a breaking change and should be listed as such.

## The Release Process

We are using [`semantic-release`](https://github.com/semantic-release/semantic-release) for the release management. It's a tool for automatic version detection based on the commit message history. It also generates the change log and adds it to github. Current set up works as follows:
1. Beta Versions
  * Commit containing a fix/feature/breaking change is merged to devel from a feature branch
  * Tests pass on the CI tool
  * During deployment phase, `semantic-release` determines the next correct version to bump and changes it in the `package.json` file
  * Version is published to `npm` with the `beta` tag. It's available with `npm i -g syncano-cli@beta`
  * `semantic-release` generates a change log and sends it to GitHub (to be implemented: the changelog should have a `pre-release` or `draft` flag)

2. Official release
  * A pull request is merged from the devel to master branch.
  * Tests pass on the CI tool
  * During deployment phase, a `latest` tag is set on the current beta version. It's now available with `npm i -g syncano-cli`

## Documentation

We are using [docsify](https://docsify.js.org) to work with our documentation. Docs are stored in the `./docs` folder and published to github pages. To start working on the documentation run the following command:

```js
npm run docs:watch
```

This will start docs local server. Open it under `http://localhost:3000`

> Notes:
- see the [`docsify`](https://docsify.js.org) page for details regarding the documentation  setup
- `docs/index.html` contains the configuration defined in the `window.$docsify` object
- `_sidebar.md` is for sidebar menu configuration
- `_coverpage.md` contains the docs landing page code



Once you finish making changes in the `./docs` folder, simply commit the changes. Doc gremlins will do the rest.
