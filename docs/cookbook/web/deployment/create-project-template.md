# Creating your own project template

* Preparation time: **3 minutes**

### Create template

Check out `syncano-node` repository:

```sh
git clone git@github.com:Syncano/syncano-node.git
```

Then create your own template repository and copy empty template:

```sh
# syncano-template-project-<your own name of the template>
cp -r syncano-node/packages/template-project-hello syncano-template-project-my-template
```

Now you can start editing template configuration file `syncano-template-project-my-template/package.json`:
- edit name of the package
- edit template files in `syncano-template-project-my-template/template` folder

### Using template

You can install your template locally in you project. To do that go to your project folder and run:

```sh
# yarn add --dev <path to template>
yarn add --dev ../syncano-template-project-my-template
```

If you template was submitted to [NPM](https://www.npm.com) you can install it as any other dependency:

```sh
# yarn add --dev <name of the template>
yarn add --dev syncano-template-project-my-template
```

Now you will be able to find your template on the list of templates while executing `npx syncano-cli init` command.
