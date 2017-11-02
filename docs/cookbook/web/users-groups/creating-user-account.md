# Creating user account

- Preparation: **3 minutes**
- Requirements:
  - Initiated Syncano project

### Problem to solve

You want to create user account inside the Socket script.

### Solution

Create empty `hello-world` Socket and `hello` endpoint, use `user` from `syncano-server` library.
`username` is given, but the `password` is going to be generated.

#### Create Socket

```sh
syncano-cli create hello-world --template example
```

#### Edit endpoint file


Edit file `syncano/hello-world/src/hello.js` and change its content to:

```js
import crypto
import Syncano from 'syncano-server'

export default (ctx) => {
  const {user, response} = Syncano(ctx)

  user.create({
    username: 'tyler.durden@paperstreetsoap.com'
    password: crypto.randomBytes(64).toString('hex')
  })
  .then(userObj => {
    response.json({msg: `User with ID ${userObj.id} created!`})
  })
}
```

### How it works?

Now you can call URL for `hello` endpoint using browser:

```
https://<your_instance_name>.syncano.space/hello-world/hello/
```
> You can find URL for `hello` endpoint by typing `syncano-cli list hello-world`

You will get a response JSON response like this one:

```js
{"msg": "User with ID 12 created!"}
```
