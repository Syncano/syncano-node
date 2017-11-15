# Documentation

- Getting Started
  - [Usage](#usage)
  - [Installation](#installation)
- [Methods](#methods)

# Getting Started

## Usage 

```js
import Validator from '@syncano/validate'

const validator = new Validator({args, meta, config})
```

## Installation

**Installing from NPM**

```bash
npm i @syncano/validate --save
```

# Methods

| Name                                                                          | Description                  |
| ----------------------------------------------------------------------------- | ---------------------------- |
| [validator.validateRequest](#validatorvalidaterequestctx)                     | Validate incoming parameters |
| [validator.validateResponse](#validatorvalidateresponseresponsetype-response) | Validate endpoint response   |

## `validator.validateRequest(ctx)`

| Type   | Name      | Default | Description                                   |
| ------ | --------- | ------- | --------------------------------------------- |
| object | **`ctx`** | {}      | Object containing `args`, `meta` and `config` |

```js
export default ctx => {
  validator.validateRequest(ctx)
}
```

## `validator.validateResponse(responseType, response)`

| Type   | Name               | Default | Description                             |
| ------ | ------------------ | ------- | --------------------------------------- |
| string | **`responseType`** |         | Name of response defined in syncano.yml |
| mixed  | **`response`**     |         | Endpoint response                       |

```js
export default ctx => {
  validator.validateResponse('success', {
    messsage: 'Action was successful'
  })
}
```
