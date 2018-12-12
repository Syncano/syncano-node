# Creating objects in a database

- Preparation: **5 minutes**
- Requirements:
  - Initiated Syncano project

### Problem to solve

A very common requirement for an application is to have a persistent storage of data. Syncano Provides this capability with a concept of Data Classes, which define the schema (type) of data you would like to store and Data Objects which store the data. This cookbook entry will walk you through a simple data set up.

### Solution

We will create a Data Class - the "container" for your data, and learn how to create Data Objects in that class.

#### Create a new Socket

We will start with creating an empty Socket. You can skip this step, if you have an existing Socket you'd like to expand.

```sh
npx s create hello-world

?   Choose template for your Socket
      Vanilla JS Socket - (@syncano/template-socket-vanilla)
❯     ES6 Socket - (@syncano/template-socket-es6)

✔   Your Socket configuration is stored at ...
```


#### Add a Data Class


Add `book` class to the `syncano/hello-world/socket.yml` file:

```yaml
classes:
  book:
    - name: title
      type: string
    - name: pages
      type: integer
```

Save the `.yml` file and update your remote Socket:
```sh
npx s deploy hello-world
```

> See Docs on [Database](https://0-docs.syncano.io/#/project/database?id=types-of-data-class-schema-fields) for more info on available data types

#### Edit Socket Endpoint file

Edit file `syncano/hello-world/src/hello.js` and change its content to:

```js
import Syncano from '@syncano/core'

export default async (ctx) => {
  const { data, response } = new Syncano(ctx)
  const book = await data.book.create({
    title: ctx.args.title,
    pages: ctx.args.pages
  })
  response.json(book)
}
```

We've imported `data` and `response` modules from the Syncano Core library. `data` is the one you will use for data operations (list, create update, delete and so on).

We also destructure `title` and `pages` from `ctx.args` object. This data will come from the client side.

Once you are finished editing the `hello.js` file, run `npx s deploy hello-world` to apply the changes to the script.

> Pro tip: use `npx s hot hello-world` to watch for changes and continuous deployment

### Client Side

The server side is ready so now the only thing left to do, is adding a client side implementation. Create an index.html file, add the code below, and save:

> Remember to change 'YOUR_INSTANCE' into the instance attached to your project. Run `npx s` in the project folder to have it printed out in your terminal.

```js
<script src="https://unpkg.com/@syncano/client"></script>
<script>
  const s = new SyncanoClient('YOUR_INSTANCE')

  s.post('hello-world/hello', { title: 'Godfather', pages: 446 })
   .then(res =>
     console.log(`Book with ID ${res.id} created!`)
   )
</script>
```

Now, when you open the `index.html` file and look in the browser console, you will see a log similar to this one:

```js
'Book with ID 3 created!'
```

Now you can retrieve it from Syncano by running `data.book.find(objectId)` with the core library.
