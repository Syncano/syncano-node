# Facebook Weather Bot

- Preparation: **6 minutes**
- Requirements:
  - Initiated Syncano project
- Source on: [GitHub](https://github.com/Syncano/syncano-cookbook-recepies/tree/master/component-login-form)
- Components:
  - [login-form](https://github.com/Syncano/react-components/tree/master/components/login-form)

### Problem to solve

You want to have login functionality on your react website. That includes react component and Syncano Socket.

### Solution

Our solution is based on one Syncano Component integrated with Syncano Socket. [login-form](https://github.com/Syncano/react-components/tree/master/components/login-form) Socket will be used to display login form. It is integrated with [user-auth](https://github.com/Syncano/syncano-socket-user-auth) Socket.

#### Use create-react-app

> You can skip this step if you already have configured app build.

Kickstart your project with [create-react-app](https://github.com/facebook/create-react-app)

```sh
$ npm i -g create-react-app
$ npx create-react-app syncano-login-form
```

or

```sh
$ yarn create react-app syncano-login-form
```

#### Installing dependencies

```sh
$ npm i @syncano-components/login-form @syncano/client @syncano/react-context @syncano/socket-user-auth antd
$ npm i --save-dev @syncano/cli
```

#### Deploy Syncano Socket

> This step assumes that you have initiated syncano project.

After installing all dependencies, now you have to deploy user authentication socket:

```sh
npx s deploy user-auth
```

#### Add login form to project

First, we need to import all required packages. Open `/src/App.js` and add imports at top:

```js
import Syncano from '@syncano/client'
import {LoginForm} from '@syncano-components/login-form'
import {SyncanoContext, withSyncano} from '@syncano/react-context'
```

Next, create Syncano client connection. This is required to communicate with user authentication Syncano Socket.

```js
const syncano = new Syncano('YOUR_INSTANCE_NAME')
```

Login form requires syncano client connection, to provide it use `SyncanoCotext` and `withSyncano` helpers. Wrap your render code with `SyncanoContext`:

```jsx
class App extends Component {
  render() {
    return (
      <SyncanoContext.Provider value={syncano}>
        {/* Rest of code */}
      </SyncanoContext.Provider>
    )
  }
}
```

Now, all components inside `SyncanoContext.Provider` will be able to `consume` provided value - syncano client connection. To consume it, use `withSyncano`:

```jsx
const ConnectedLoginForm = withSyncano(LoginForm)

class App extends Component {
  render() {
    return (
      <SyncanoContext.Provider value={syncano}>
        <ConnectedLoginForm />
      </SyncanoContext.Provider>
    )
  }
}
```

In this step, we've also added `ConnectedLoginForm` to render method.

### Testing functionality

To test it, run `npm start` in project folder. It will open browser at [http://localhost:3000](http://localhost:3000). Whole example is available [here](https://github.com/Syncano/syncano-cookbook-recepies/tree/master/component-login-form)
