# Data Object relation and reference fields

- Preparation: **30 minutes**
- Requirements:
  - Initiated Syncano project
  - An existing Socket

### Problem to solve

There are cases, where you'd like to have links between Data Objects. There are 3 possible options here:

one-to-one - One Data Object is connected to another.
one-to-many - One Data Object has relations with many other.
many-to-many - This type of relation allows for creating a net of connections.

We will dig into those solutions in the sections below.


### Creating one-to-one reference

one-to-one relationships can come in handy in a couple of situations:
- Limiting access to part of the stored data - In this case Data Objects could be in different Data Classes, where different users would have access to each of these Data Classes. This would allow making only part of the data visible.
- Splitting Data Object because of size limits - Data Object size limit is 32 kB. In case this is not enough you could store rest of the data in a referenced Data Object (another, often better, alternative is using the file field for data storage).

#### Add a Data Class

Use an existing Socket or create one with `npx s create`. Add the following in the `socket.yml` file:

```yaml
classes:
  first:
    - name: info
      type: string
  second:
    - name: info
      type: string
    - name: reference
      type: reference
      target: public

endpoints:
  create-objects:
    description: Create two Data Objects
```

Save the `.yml` file and update your remote Socket:
```sh
npx s deploy <socket-name>
```


#### Edit Socket Endpoint file

Create/edit file in `syncano/<SOCKET>/src/<SOCKET_NAME>.js` and change its content to:

```js
import Syncano from '@syncano/core'

export default (ctx) => {
  const { data, response } = new Syncano(ctx)

  data.first.create({ info: 'A publicly available data' })
    .then(dataObj => {
      console.log(`Data Object ${dataObj.id} in first class created`)

      data.second.create({
        info: 'Additional data stored in a second object',
        reference: dataObj.id })
        .then(dataObj => {
          console.log(`Data Object ${dataObj.id} in a second class created`)
        })
    })
    .catch(({ data, status }) => {
      return response.json(data, status)
    })
}
```

> Pro tip: use `npx s hot <socket_name>` to watch for Socket changes and continuous deployment

Now you can run `npx s call <socket>/create-objects` and observe that two Data Objects were created. The second one will store the ID of a first one as a reference.

### Creating one-to-any and many-to-many relations

To create one-to-many or many-to-many relationships you can use Syncano's relation field. It's an array where you can store ids of connected Data Objects. So, for example if you had an authors and books Data Classes you could create a relation field in the authors Data Class. This field could hold an array of Data Object ids representing books from the books Data Class.

#### Add Data Classes and Socket Endpoint

Edit your `socket.yml` file to contain the following fields:

```yaml
classes:
  books:
    - name: title
      type: string
  authors:
    - name: name
      type: string
    - name: books
      type: relation
      target: books

endpoints:
  add-library-entry:
    description: Add books and a corresponding author
    parameters:
      name:
        type: string
        description: A book author name
      books:
        type: array
        description: An array of book objects
        example: |
         [
           { title: 'The Adventures of Tom Bombadil' },
           { title: 'A Dream of Spring'}
         ]
```

#### Edit the Socket Endpoint file

Here's a simple example of how you could use Socket Scripts to add Data Objects with relation fields. Add the `add-library-entry.js` file in the `/src` folder and paste the code below.


```js
import Syncano from '@syncano/core'

export default (ctx) => {
  const { data, response } = new Syncano(ctx)
  const { books, name } = ctx.args

  // data.<class>.create also accepts an array of objects. and this is what
  // I'm using this feature to populate the library with books as 'books'
  // is an array of objects: [{ title: ...}, { title: ...}] etc.
  data.books.create(books)
    .then(res => {
      // response is an array of created book Data Objects. I'm getting the
      // ids to pass as relations to the author object
      const ids = res.map(obj => obj.id)

      data.authors.create({ name, books: ids })
        .then(res => {
          return response.json(res)
        })
        .catch(({ data, status }) => {
          return response.json(data, status)
        })
    })
    .catch(({ data, status }) => {
      return response.json(data, status)
    })
}
```

> Remember to save and deploy your socket with `npx s deploy <socket-name>`

#### Client side

On the client side, you would make a post request to the `add-library-entry` with a payload in form of an object containing the `name` and `books` properties. The server side code from the previous section would split the payload and create separate entries with relations in the database.

> Remember to change 'YOUR_INSTANCE' into the instance attached to your project. Run `npx s` in the project folder to have it printed out in your terminal.

```html
<script src="https://unpkg.com/@syncano/client"></script>
<script>
  const s = new SyncanoClient('YOUR_INSTANCE')

  s.post('new-sockit/add-library-entry', {
    name: 'J. R. R. Tolkien',
    books: [
        { title: 'The Adventures of Tom Bombadil' },
        { title: 'On Fairy-Stories, Smith of Wootton Major' }
    ]
  })
   .then(res => {
     console.log(res)
   })
</script>
```

When you observe the console output in your browser dev tools, you'll notice the created Data Object. It should look, more or less, like this:

```json
{
	"id": 32,
	"created_at": "2018-03-08T13:20:11.338191Z",
	"updated_at": "2018-03-08T13:20:11.338224Z",
	"revision": 1,
	"acl": {},
	"channel": null,
	"channel_room": null,
	"name": "J. R. R. Tolkien",
	"books": [30, 31],
	"links": {
		"self": "/v2/instances/instance/classes/authors/objects/32/"
	}
}
```

As you can see, the `books` relation field of this `author` Data Object got populated with the ids of `book` Data Objects.

#### Expanding the requested Data Objects with the referenced ones

The default behavior when making a get request for a Data Object with a reference field is to only return the referenced object ID in this field. It's possible, however, to get the reference field expanded with the second Data Object. This is the core library code that would achieve this:

```js
import Syncano from '@syncano/core'

export default (ctx) => {
  const { data, response } = new Syncano(ctx)

  data.authors.with('books')
    .list()
    .then(objects => {
      return response.json(objects)
    })
}
```

You will receive a list of full Data Objects available in the `books` relation field:

```json
[
  { "id": 6,
    "name": "J. R. R. Tolkien",
    "books": [
      {
        "id": 5,
        "title": "On Fairy-Stories"
      }
    ]
  }
]
```

> `with` property works both for `relation` and `reference` fields. It will return an array of Data Objects for `relation` field and a nested Data Object for `reference` field.
