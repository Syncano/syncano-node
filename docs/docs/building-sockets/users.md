# About users
In Syncano you have database classes. Users are just another type of database classes and you should think about users as a specific model of database. The easiest way to manage users is by using Syncano socket named user-auth.   

### Managing Users
Thanks to built-in functionalities in user-auth socket you have access to following user actions:

- register user
- login (authenticate)
- update users data
- delete user

### How to create User

```js
// syncano/<yoursocektname>/<endpointname>.js
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

## How to use user-auth socket

### Register User

```js
const s = new SyncanoClient("YOUR-INSTANCE-NAME");

s.post("user-auth/register", {
  username: "john@email.com",
  password: "superpass123"
}).then(res => {
  s.setToken(res.token)
  // Once token is set all reqests will receive this token 
}).then(() => {
  s.post("hello/hello").then(res => {
    console.log(res)
  })
})
```


### Login User

```js
const s = new SyncanoClient("YOUR-INSTANCE-NAME");

s.post("user-auth/login", {
  username: "john@email.com",
  password: "superpass123"
}).then(res => {
  s.setToken(res.token)
  
}).then(() => {
  s.post("hello/hello").then(res => {
    console.log(res)
  })
})
```

### Update User Data
```js
// syncano/<yoursocektname>/<endpointname>.js
import Syncano from '@syncano/core'

export default async (ctx) => {
  const {response, users} = new Syncano(ctx)
  const {args, meta} = ctx 
  
  if(!meta.user) {
    return response.json("Unauthorised", 401)
  }

  await users.update(meta.user.id, {
    username: args.username,
    password: args.password
  })

  response.json({msg: `User with ID ${meta.user.id} has been updated!`})
}
```

### Delete User
```js
// syncano/<yoursocektname>/<endpointname>.js
import Syncano from '@syncano/core'

export default async (ctx) => {
  const {response, users} = new Syncano(ctx)
  const {args, meta} = ctx 
  
  if(!meta.user) {
    return response.json("Unauthorised", 401)
  }

  await users.delete(meta.user.id)

  response.json({msg: `User with ID ${meta.user.id} has been deleted!`})
}
```
