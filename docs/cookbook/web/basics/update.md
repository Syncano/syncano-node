# Update your socket to 0.8+ version 

- Preparation: **3 minutes**
- Requirements:
  - Existing Syncano socket, that is not working with the current 

### Problem to solve

If you get `Error while executing 'build' script!` error you have to update your socket to work with the current Syncano version.

### Solution

You'll have to create/update some files to make things work again.

#### Create bin directory

At first, you have to create directory called `bin` inside of your socket. After that, place two files inside: `compile` and `compile-env` (note, that they have no extensions).

`compile` file contents:

```sh
#!/usr/bin/env sh

mkdir -p .dist
npx babel src --out-dir .dist/src --copy-files

```

`compile-env` file contents:

```sh
#!/usr/bin/env sh

mkdir -p .dist
cp package.json .dist
cd .dist
npm install --production

```

#### Update package.json

You have to add scripts section and dependencies to your socket.

```js 
  "scripts": {
    "build": "npm install && npm run build:src && npm run build:env",
    "build:src": "sh ./bin/compile",
    "build:env": "sh ./bin/compile-env"
  },
  "devDependencies": {
    "babel-cli": "^6.26.0",
    "babel-preset-env": "^1.6.1"
  },
  "babel": {
    "presets": [
      [
        "env",
        {
          "targets": {
            "node": "8"
          }
        }
      ]
    ]
  }
```


#### Update socket.yml

Since version 0.8 your socket has to contain `runtime` definition

```yaml
name: my-old-socket
version: 0.1.14
description: My old socket 
runtime: nodejs_v8
```

