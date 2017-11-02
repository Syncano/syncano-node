# Creating objects in a database

- Preparation: **1 minute**
- Requirements:
  - Initiated Syncano project

### Problem to solve

You want to create two object of different classes.

### Solution

Create empty `hello-world` Socket and `hello` endpoint, use `data` from `syncano-server` library.

#### Create Socket

```sh
syncano-cli create hello-world --template example
```

#### Add data class

Add `book` class to the `syncano/hello-world/socket.yml` file:

```yaml
classes:
  book:
    - name: title
      type: string
    - name: pages
      type: ineger
```

#### Edit endpoint file


Edit file `syncano/hello-world/src/hello.js` and change its content to:

```js
import Syncano from 'syncano-server'

export default (ctx) => {
  const {data, response} = Syncano(ctx)

  data.book.create({
    title: 'Peter Pan',
    pages: 334
  })
  .then(bookObj => {
    response.json({msg: `Book with ID ${bookObj.id} created!`})
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
{"msg": "Book with ID 123 created!"}
```
