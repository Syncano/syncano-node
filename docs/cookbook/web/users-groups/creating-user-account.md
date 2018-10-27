# Creating user account

- Preparation: **3 minutes**
- Requirements:
  - Initiated Syncano project

### Problem to solve

You want to create user account inside the Socket script.

### Solution

Create empty `hello-world` Socket and `hello` endpoint, use `user` from `@syncano/core` library.
`username` is given, but the `password` is going to be generated.

#### Create Socket

```sh
npx s create hello-world
```

#### Edit endpoint file


Edit file `syncano/hello-world/src/hello.js` and change its content to:

```js
import Syncano from '@syncano/core'

export default async (ctx) => {
  const {response, users} = new Syncano(ctx)
  const {args} = ctx 

  const user = await users.create({
    username: args.username,
    password: args.password
  })

  response.json({msg: `User with ID ${user.id} created!`})
}
```

### How it works?

Now you can call URL for `hello` endpoint using browser:

```
https://<your_instance_name>.syncano.space/hello-world/hello/
```
> You can find URL for `hello` endpoint by typing `npx s list hello-world`

You will get a response JSON response like this one:

```js
{"msg": "User with ID 12 created!"}
```
