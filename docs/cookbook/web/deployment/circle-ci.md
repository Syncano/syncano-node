# Deploying project using CircleCI

* Preparation time: **3 minutes**
* Requirements:
  - Initiated Syncano project
  - [Understand Syncano hosting](https://0-docs.syncano.io/#/project/hosting)
  - [CircleCI account](https://circleci.com/)

### Problem to solve

You want to configure CircleCi for Syncano project.

### Solution

### Create CircleCI configuration file

First you should create syncano.yml in your project folder:

```yaml
hosting:
  website:
    src: ../.build/website
    config:
      browser_router: true

```

If you will create hosting from cli this file above will be created automatically.

```sh
npx s hosting add <PATH>
```

Next step is to go to your Syncano project folder and create CircleCI config file:

```sh
cd ~/my_syncano_project/
touch circle.yml
```

Now edit `circle.yml` file:

```yaml
version: 2

jobs:
  install:
    docker:
      - image: circleci/node
    working_directory: ~/repo
    steps:
      - checkout
      - restore_cache:
          keys:
          - v1-dependencies-{{ checksum "package.json" }}
      - run:
          name: Installing Dependencies
          command: npm i
      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-{{ checksum "package.json" }}
      - persist_to_workspace:
          root: .
          paths:
            - node_modules
  upload-website:
    docker:
      - image: circleci/node
    working_directory: ~/repo
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run:
          name: Uploading website and setting CNAME
          command: |
            npx s hosting sync website
            npx s hosting config website -b true # --cname YOUR_CNAME
workflows:
  version: 2
  build-test-deploy:
    jobs:
      - install
      - upload-website:
          requires:
            - install
```

Now add this file to your repository:

```sh
git add circle.yml
git commit -m "CircleCi config file"
git push
```

Next step is to log in to CircleCI dashboard and go to the `Projects` tab and add a project using `Add project` button.
