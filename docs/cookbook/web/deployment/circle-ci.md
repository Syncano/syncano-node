# Deploying project using CircleCI

* Preparation time: **3 minutes**
* Requirements:
  - Initiated Syncano project
  - CircleCI account (https://circleci.com/)

### Create CircleCI configuration file

First step is to go to you Syncano project folder and create CircleCI config file:

```sh
cd ~/my_syncano_project/
touch circle.yml
```

Now edit `circle.yml` file:

```yaml
machine:
  node:
    version: 7
  environment:
    PATH: "${PATH}:${HOME}/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:${HOME}/${CIRCLE_PROJECT_REPONAME}/node_modules/.bin"

dependencies:
  override:
    - yarn global add syncano-cli

test:
  override:
    - exit 0

deployment:
  production:
    branch: master
    commands:
      - syncano-cli deploy
```

Now add this file to your repository:

```sh
git add circle.yml
git commit -m "CircleCi config file"
git push
```

Next step is to log in to CircleCI dashboard got to the `Projects` tab and add a project using `Add project` button.
