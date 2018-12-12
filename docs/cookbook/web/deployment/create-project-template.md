# Creating your own project template

* Preparation time: **5 minutes**

### Problem to solve

You want to create a template project which you will be able to choose during the project initialization process, when using `npx s init` command.

### Solution

Check out `syncano-node` repository:

```sh
git clone https://github.com/Syncano/syncano-node.git
```

### Create template

Then create your own template repository and copy empty template:

```sh
# syncano-template-project-<your own name of the template>
cp -r syncano-node/packages/template-project-hello syncano-template-project-my-template
```

Now you can start editing template configuration file `syncano-template-project-my-template/package.json`:
- edit name of the package
- edit template files in `syncano-template-project-my-template/template` folder

!> name of the package must start with  `syncano-template-project`

### Using template

You can install your template locally in you project. To do that go to your project folder and run:

```sh
# npm install --save-dev ../<path to template>
npm install --save-dev ../syncano-template-project-my-template
```

Install the Syncano CLI in your project:
```sh
npm install @syncano/cli --save-dev
```

### How it works?

Now you will be able to find your template on the list of templates while executing `npx s init` command:

```sh
Choose template for your project (Use arrow keys)
  Empty Project Template - (@syncano/template-project-empty) 
  Hello World Project Template - (@syncano/template-project-hello) 
  Your New Project Template - (syncano-template-project-my-template) 
```
