# Users

With `users` you're able to:
- Get single user data
- List and filter users
- Create, update, delete users

# Import

```js
const {users} = new Server(ctx)
```

# Methods

`users` api is the same as `data`. The only difference is that you don't need to pass class name after `users`:

```js
users.method1().method2()
  .then(res => {})
  .catch(err => {})

data.<class_name>.method()
  .then(res => {})
  .catch(err => {})
```

[Read data docs](/docs/data.md) for full API reference.

# Examples

**Get all users**

```js
users.list()
```

**Filter users**

```js
users
  .where('likes_count', '>=', 100)
  .where('views_count', '<=', 10000)
  .list()
```

**Create user**

```js
users.create({
  username: 'john.doe',
  password: 'xyz',
  email: 'john.doe@example.com'
})
```

**Update user**

```js
users
  .where('username', 'john.doe')
  .update({
    account_confirmed: true,
    activated_at: new Date().toISOString()
  })
```

**Delete user**

```js
users
  .where('username', 'john.doe')
  .delete()
```

[Read data docs](/docs/data.md) for more examples.
