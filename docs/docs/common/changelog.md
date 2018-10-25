# Changelog

## v0.9.0

**Released on 2017-04-19**

Changelog:
* feat(help): nicer help
* fix(attach): small refactor of broken loading and attaching instance
* refactor(add): socket aware dependency installation
* fix(commands): remove unused files
* fix(lint): linter improvements
* fix(tracking): fixing tracking sigunps and signins
* chore(tracking): setting up batch calls

## v0.6.0

**Released on 2017-04-14**

Changelog:
#### Bug Fixes
  * **tests:** (#260) ([b425eee3](https://github.com/Syncano/syncano-node-cli/commit/b425eee3))

## v0.5.0

**Released on 2017-04-12**

Changelog:

#### Features
  * **debug:** version in debug (#256) ([ede24641](https://github.com/Syncano/syncano-node-cli/commit/ede24641))

## v0.3.0

**Released on 2017-04-11**

Changelog:

#### Bug Fixes:
  * **build:** change yarn into npm command ([65776aac](https://github.com/Syncano/syncano-node-cli/commit/65776aac))
  * **release:** fixing master releases ([7c6e34a7](https://github.com/Syncano/syncano-node-cli/commit/7c6e34a7))

## v0.2.0

**Released on 2017-04-11**

Changelog:

#### Bug Fixes:
* **circle:** removing unnecessery things ([955cf0c7](https://github.com/Syncano/syncano-node-cli/commit/955cf0c7))
* **deploy:**
* fix for beta/latest deployment flow ([0190fe5f](https://github.com/Syncano/syncano-node-cli/commit/0190fe5f))
* fix master deployment to use semantic release ([71c296a2](https://github.com/Syncano/syncano-node-cli/commit/71c296a2))
* **tests:** style ([14f450d5](https://github.com/Syncano/syncano-node-cli/commit/14f450d5))

#### Features:
* **analytics:** segment integration ([84ecb621](https://github.com/Syncano/syncano-node-cli/commit/84ecb621))

## v0.0.3

**Released on 2017-04-10**

  #### Bug Fixes

  * **call:** printing error reponse ([75a76778](https://github.com/Syncano/syncano-node-cli/commit/75a76778))
  * **commands:** missing file ([d3458474](https://github.com/Syncano/syncano-node-cli/commit/d3458474))
  * **config-set:** missing file ([14b1e426](https://github.com/Syncano/syncano-node-cli/commit/14b1e426))
  * **init:**
    * fixing order of searching for project ([01b1772d](https://github.com/Syncano/syncano-node-cli/commit/01b1772d))
    * empty project ([3b7089da](https://github.com/Syncano/syncano-node-cli/commit/3b7089da))
  * **install:**
    * installing socket with dependencies ([a1a5f658](https://github.com/Syncano/syncano-node-cli/commit/a1a5f658))
    * improving installation process ([c65ab025](https://github.com/Syncano/syncano-node-cli/commit/c65ab025))
    * waiting for full unpack of the zip file ([2e678096](https://github.com/Syncano/syncano-node-cli/commit/2e678096))
  * **list:** print full endpoint name ([6325cea3](https://github.com/Syncano/syncano-node-cli/commit/6325cea3))
  * **packages:** explicit version ([7050148d](https://github.com/Syncano/syncano-node-cli/commit/7050148d))
  * **session:** Syncano hosting unhandled rejection when no yml available ([7a27fe76](https://github.com/Syncano/syncano-node-cli/commit/7a27fe76))
  * **socket:**
    * if no deps ([17f3c305](https://github.com/Syncano/syncano-node-cli/commit/17f3c305))
    * fix for sync ([798e03d2](https://github.com/Syncano/syncano-node-cli/commit/798e03d2))
    * getting handlers and events ([0819d769](https://github.com/Syncano/syncano-node-cli/commit/0819d769))
  * **socket_install:** creating build folder ([edd0d7a2](https://github.com/Syncano/syncano-node-cli/commit/edd0d7a2))
  * **sockets:**
    * creating socket which exist ([b94b383a](https://github.com/Syncano/syncano-node-cli/commit/b94b383a))
    * if there is no path, do not load settings ([fc080269](https://github.com/Syncano/syncano-node-cli/commit/fc080269))
    * fix for different small things ([9d6e058a](https://github.com/Syncano/syncano-node-cli/commit/9d6e058a))
    * finding local sockets names ([83005f81](https://github.com/Syncano/syncano-node-cli/commit/83005f81))
  * **structure:** missing file ([30640d3f](https://github.com/Syncano/syncano-node-cli/commit/30640d3f))
  * **sync:**
    * unified sync of sockets, some small fixes ([d865286a](https://github.com/Syncano/syncano-node-cli/commit/d865286a))
    * mainly fixing config synchronization ([62db81f9](https://github.com/Syncano/syncano-node-cli/commit/62db81f9))
  * **tests:**
    * better test check (#233) ([689ae9ff](https://github.com/Syncano/syncano-node-cli/commit/689ae9ff))
    * for now we call it updated, later it will be deployed ([02728d16](https://github.com/Syncano/syncano-node-cli/commit/02728d16))
    * skiping problemacit test ([ae2eaf93](https://github.com/Syncano/syncano-node-cli/commit/ae2eaf93))
    * disabe test which is undesirable creating config file ([ac1987f6](https://github.com/Syncano/syncano-node-cli/commit/ac1987f6))
    * skiping call test for now ([b9dfde1d](https://github.com/Syncano/syncano-node-cli/commit/b9dfde1d))
  * **typos:** small fixes and typos ([f9db641b](https://github.com/Syncano/syncano-node-cli/commit/f9db641b))
  * **watch:** proper prints for event traces ([137a8d3f](https://github.com/Syncano/syncano-node-cli/commit/137a8d3f))
  * **yarn.lock:** [yarn-hotfix] Update yarn.lock with missing packages ([159130e7](https://github.com/Syncano/syncano-node-cli/commit/159130e7))


  #### Features

  * **commands:** [CLI-162] Improved watchdog output ([3593f8bb](https://github.com/Syncano/syncano-node-cli/commit/3593f8bb))
  * **config:** additional method for setting config option ([227966fe](https://github.com/Syncano/syncano-node-cli/commit/227966fe))
  * **config-show:** list config options of the socket ([37890090](https://github.com/Syncano/syncano-node-cli/commit/37890090))
  * **debug:** slightly different and improved  debuging ([126f353a](https://github.com/Syncano/syncano-node-cli/commit/126f353a))
  * **docs:**
    * libs docs ([b9fd098e](https://github.com/Syncano/syncano-node-cli/commit/b9fd098e))
    * Fix typo ([3e9de49e](https://github.com/Syncano/syncano-node-cli/commit/3e9de49e))
    * WIP. ([639fabff](https://github.com/Syncano/syncano-node-cli/commit/639fabff))
    * mainly CLI reference ([0c06600b](https://github.com/Syncano/syncano-node-cli/commit/0c06600b))
    * some new docs ([974d8674](https://github.com/Syncano/syncano-node-cli/commit/974d8674))
  * **install:** recursive finding dependencies ([0d4fe3fb](https://github.com/Syncano/syncano-node-cli/commit/0d4fe3fb))
  * **registry:** publish, config ([6ea69ea5](https://github.com/Syncano/syncano-node-cli/commit/6ea69ea5))
  * **registry install:** new way of installing sockets from registry ([9cb0a801](https://github.com/Syncano/syncano-node-cli/commit/9cb0a801))
  * **sentry:** refactoring of sentry reporting ([aed053dd](https://github.com/Syncano/syncano-node-cli/commit/aed053dd))
  * **settings:** new yaml parser ([ab9cda74](https://github.com/Syncano/syncano-node-cli/commit/ab9cda74))
  * **socket:** syncing sockets with deps ([54b9c5ac](https://github.com/Syncano/syncano-node-cli/commit/54b9c5ac))
  * **socket list:** printing events and event handlers ([f41de5c1](https://github.com/Syncano/syncano-node-cli/commit/f41de5c1))
  * **sockets:** do yarn before sync ([3aef9f2e](https://github.com/Syncano/syncano-node-cli/commit/3aef9f2e))
  * **sync:**
    * sync buffer ([5a74c0cc](https://github.com/Syncano/syncano-node-cli/commit/5a74c0cc))
    * partial sync ([71c63d73](https://github.com/Syncano/syncano-node-cli/commit/71c63d73))
    * turn on compression ([e95eb337](https://github.com/Syncano/syncano-node-cli/commit/e95eb337))
  * **watch:**
    * [CLI-162] improve watch command output ([3edaaf71](https://github.com/Syncano/syncano-node-cli/commit/3edaaf71))
    * poll traces from channel ([07303710](https://github.com/Syncano/syncano-node-cli/commit/07303710))


* * *

(For releases previous to **0.1**, see [releases](https://github.com/syncano/syncano-cli/releases))
