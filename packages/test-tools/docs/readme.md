# Documentation

- Getting Started
  - [Usage](#usage)
  - [Learn more](#learn-more)
  - [Installation](#installation)
- [Methods](#methods)

# Getting Started

## Usage 

```js
import {run, generateMeta} from '@syncano/test'
```

```js
run('generate', {args, meta})
  .then(response => response.is('success'))
  .then(response => {
    assert.propertyVal(response, 'data', '<p>Hello, my name is John</p>')
  })
```

## Learn more

More examples how to create tests and use Syncano Test library you can find in the [Tests section](https://cookbook.syncano.io/) of the Cookbook. 

## Installation

**Installing from NPM**

```bash
npm i @syncano/test --save
```

# Methods

| Name                                     | Description                                       |
| ---------------------------------------- | ------------------------------------------------- |
| [generateMeta](#generatemeta)            | Generate radnom meta data                         |
| [run](#runendpointname-args-meta-config) | Call socket locally                               |
| [response.is](#responseisresponsename)   | Check if response match response from syncano.yml |

## `generateMeta()`

Generating random metadata. Usually you don't need to use this method and instead of it pass additional metadata keys to the run method. Those examples are equal:

```js
run('generate', {args, meta: {newMetaKey: 'test value'}})
```

```js
const meta = generateMeta()

meta.newMetaKey = 'test value'

run('generate', {args, meta})
```


## `run(endpointName, options?)`

| Type   | Name                 | Default | Description                   |
| ------ | -------------------- | ------- | ----------------------------- |
| string | **`endpointName`**   |         |                               |
| object | **`options`**        | {}      |                               |
| object | **`options.args`**   | {}      | Parameters passed to endpoint |
| object | **`options.meta`**   | {}      | Endpoint configuration        |
| object | **`options.config`** | {}      | Socket configuration          |

```js
run('generate', {args, meta})
  .then(response => {
    assert.propertyVal(response, 'data', '<p>Hello, my name is John</p>')
  })
```

## `response.is(responseName)`

| Type   | Name               | Default | Description                    |
| ------ | ------------------ | ------- | ------------------------------ |
| string | **`responseName`** |         | Response name from syncano.yml |

Check if the response is valid. This operation verifies response based on schema definition in `socket.yml`:

- exit code
- MIME type
- arguments

```js
run('search', {args: {post_code: '0161'}})
  .then(response => response.is('success'))
  .then(response => {
    assert.propertyVal(response.data, 'city', 'Oslo')
    assert.propertyVal(response.data, 'municipality', 'Oslo')
    assert.propertyVal(response.data, 'county', 'Oslo')
    assert.propertyVal(response.data, 'category', 'G')
    done()
  })
  .catch(err => {
    done(err)
  })
```
