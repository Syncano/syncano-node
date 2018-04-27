# Two factor authentication socket

- Preparation: **20 minutes**
- Requirements:
  - Initiated Syncano project
- Sockets:
  - [user-auth](https://syncano.io/#/sockets/user-auth)
  - [two-factor-auth](https://syncano.io/#/sockets/two-factor-auth)

### Problem to solve

You have an online platform where you want to have registered users have the option of using two factor authentication to login.

### Solution

Our solution is to use [two-factor-auth](https://syncano.io/#/sockets/two-factor-auth) Syncano socket along with [user-auth](https://syncano.io/#/sockets/user-auth) to add/enable the option for two factor authentication on your online platform.

### Setup

#### Installing server dependencies

To install and deploy `user-auth` type:
```sh
$ npx s add user-auth
$ npx s deploy user-auth
```

To install and deploy `two-factor-auth` type:
```sh
$ npx s add two-factor-auth
$ npx s deploy two-factor-auth
```

#### JavaScript client setup

Install syncano-client to interact with Syncano socket endpoints: 
N/B: There are two way's of achieving installation.

1. When using webpack and es6 the way to handle the client lib is:
Shell:

```sh
$ npm i -S @syncano/client
```

Create a connection by initializing Syncano object with instance name:

```javascript
import SyncanoClient from "@syncano/client"

const s = new SyncanoClient("MY_INSTANCE_NAME");
```

2. And the vanilla js way:
```HTML
<script src="https://unpkg.com/@syncano/client"></script>
<script>
  const s = new SyncanoClient("MY_INSTANCE_NAME");
</script>
```

> Remember to change 'YOUR-INSTANCE' into the instance attached to your project. Run `npx s` in the project folder to have it printed out in your terminal.

##### Register a new user on your platform by sending a request to `user-auth/register` endpoint
  
Sample script to register user

```javascript
const args = {
  username: "hello@syncano.com",
  password: "a_strong_password"
};
  
s.post('user-auth/register', args)
  .then((res) => {
    console.log(res);
  })
```

##### Proceed to send a request to `two-factor-auth/setup-two-factor` with the user's username and token to setup two factor authentication for user account

Sample script to setup user account for two factor authentication

```javascript
const args = {
  username: "hello@syncano.com",
  token: "abcdefgh"
};
  
s.post('two-factor-auth/setup-two-factor', args)
  .then((user) => {
    console.log(user);
  })
```

This will return the following response:
```
{
  message: "Verify OTP",
  tempSecret: "LBGDOZBIKARWIRZI",
  otpURL: "otpauth://totp/SecretKey?secret=LB",
  dataURL: "data:image/png;base64,iVBORw0KGgoAAAANS"
}
```

The `dataURL` in the response is an image url in base64 which you can use to display a Google Authenticator compatible QR code.

Display a QR code using the `dataURL` as `src` in an image tag
```JSX
<img src=`${dataURL}`/>
```
Scan the QR code with a two-factor auth app like
[Google Authenticator](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en)

##### To complete the process of setting up user account for two-factor auth send another request to `two-factor-auth/verify-token` with parameters

`username=[string]` - user email

`token=[string]` - user token

`two_factor_token=[string]` - One-time passcode from two factor app like [Google Authenticator](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en)

*This process is essential to verify a two-factor token before enabling two-factor authentication on a user account to prevent locking the user.*

Sample script to verify two-factor app token before enabling two factor authentication on user account
```javascript
s.post('two-factor-auth/verify-token', { username, token, two_factor_token })
  .then((res) => {
    console.log(res);
  })
```

A response with status code `200` will be returned which signifies two factor authentication enabled on user account if the `two_factor_token` is successfully verified.

##### To login a user who has enabled two-factor authentication send a request to `two-factor-auth/login` with parameters

with parameters

`username=[string]` - user email

`token=[string]` - user token

`two_factor_token=[string]` - One-time-passcode (Not required for user's without two factor authentication enabled on their account)

**_Using syncano-client library_**

```javascript
s.post('two-factor-auth/login', { username, token, two_factor_token })
  .then((user) => {
    console.log(user);
  })
```

##### To disable two factor authentication for users with two factor authentication enabled on their account send a request to `two-factor-auth/disable-two-factor`

with parameters

`username=[string]` - user email

`token=[string]` - user token

`two_factor_token=[string]` - One-time-passcode from two factor app

**_Using syncano-client library_**

```javascript
s.post('two-factor-auth/disable-two-factor', { username, token, two_factor_token })
  .then((res) => {
    console.log(res);
  })
```

#### Demo web app
Demo web app [repo](https://github.com/Syncano/synacno-react-demo-two-factor-auth-socket) with two-factor-auth socket using React client library 
