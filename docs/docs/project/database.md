# Syncano Database

Syncano allows you to use built-in NoSQL database. Every instance is automatically connected to the database. Sockets can contain database schema which will be deployed automatically.

# Defining

> To make use of the database you need to know what is the socket. If you don't know click [here](/getting-started/sockets)

Imagine that we're making a list of books. To do this, we need to define a class that includes books and authors.

> Classes are the equivalent of table in relational database (table's schema, fields' description).
An object is a row in the table.

To define a class we need to edit socket file (for example socket.yml).

Our example file will look like this:

```YAML
name: api
description: Database socket

classes:
  book:
    - name: title
      type: string
      filter_index: true
    - name: author
      type: reference
      target: user
    - name: pages
      type: integer
    - name: publish_date
      type: datetime
    - name: categories
      type: relation
      target: category
    - name: discount
      type: float
  author:
    - name: firstname
      type: string
    - name: lastname
      type: string
  category:
    - name: name
      type: string
  
endpoints:
  create:
    description: Create book
```

Database schema will be updated after the deploy.

!> WARNING: Deleting a field from the schema deletes data from this column.

You only define fields that are directly related to this class.

You don't need to remeber about these fields:

- id - unique object identifier
- revision - informs you how many times the object was edited
- created_at - date of creation
- updated_at - date of update

These fields are added automatically.

### Types of Data Class Schema Fields

The following types of fields are supported in data class schema:

|Type|Description|Limit|
|---|---|---|
|`string`|Double-quoted Unicode with backslash escaping|128 max character length|
|`text`|Double-quoted Unicode with backslash escaping|32000 max character length|
|`integer`|Digits 1-9, 0 and positive or negative|32-bit (signed)|
|`float`|Fractions like 0.3, -0.912 etc. Double precision field with up to 15 decimal digit precision|64-bit|
|`array`|An ordered sequence of values (`string` or number)||
|`object`|An unordered collection of key:value pairs||
|`boolean`|`true` or `false` (default value is `null`)||
|`datetime`|ISO 8601, UTC date time format with microsecond precision (i.e. 2015-02-13T07:32:05.659737Z)||
|`file`|Stored as url|128 mb|
|`relation`|Comma-separated references (`id`) to Data Objects|12312, 3213, 8422|
|`reference`|Reference (`id`) to a single Data Object|10|
|`geopoint`|Longitude and latitude|&nbsp;|

### Relation and Reference field

If a field in the schema is of type `relation` or `reference`, there has to be a specified target. A target can either be self or a name of another data class.

`Reference` is a one to one relation type.
Example: The book may have one author.

`Relation` is a one to many relation type.
Example: One book can own any amount of categories.

Excerpt from a schema defined above:

```YAML
  - name: author
    type: reference
    target: user
  - name: categories
    type: relation
    target: category
```

### Geopoint

To get precise location we can use geopoints.

```classes:
  chat:
    - name: location
      type: geopoint
      filter_index: true
```

```data.book.create({
  location: {
    latitude: 53.125568,
    longitude: 23.1305894
  }
})
```

### Indexes

Indexes are necessary if you want to filter or order data objects based on a chosen field.

- `filter_index`
- `order_index`
- `unique`

You can add indexes to _most_ of the field types. 

**Types without indexes are:**

- text
- file

Example:

```
classes:
  book:
    - name: title
      type: string
      filter_index: true
```

```JavaScript
await data.book.where('title', 'Godfather').list()
```

# Database Queries

> With data method you're able to:
- Create, update, delete and list records from Syncano Classes

## Core Methods

|Name|Description|
|---|---|
|`create`|Save a new object and return the instance|
|`update`|Update the object in the database|
|`updateOrCreate`|Create or update a record matching the attributes, and fill it with values|
|`delete`|Delete the object from the database|
|`list`|List objects matching query|
|`first`|Get first object matching query or return null|
|`firstOrFail`|Get first object matching query or throw error|
|`firstOrCreate`|Get the first record matching the attributes or create it|
|`find`|Find a object by its primary key|
|`findOrFail`|Find a object by its primary key or throw an exception|
|`where`|Add a basic where clause to the query|
|`orWhere`|Add OR clause to the query|
|`whereNull`|Filter columns with value of null|
|`whereNotNull`|Filter objects where column value is not null|
|`whereIn`|Filter by existence in given array|
|`whereNotIn`|Filter out objects not existing in given array|
|`whereBetween`|Filter objects where column is between given values|
|`with`|Being querying an object with eager loading|
|`orderBy`|Add an "order by" clause to the query|
|`skip`|Skip given number of results and return the rest|
|`take`|Take given number of results|
|`fields`|Whitelist returned fields|
|`pluck`|Return array of values for single column|
|`value`|Return column value of first object matching query|
|`count`|Return number of objects matching query|

## Creating Objects

> Create function works like insert query in SQL.

To add an object to database we can use `create()`:

|Type|Name|Default|Description|
|---|---|---|---|
|object|data|null|Data used to create record|

```JavaScript
import Syncano from '@syncano/core'

export default async (ctx) => {
  const { response, data } = new Syncano(ctx)
  const book = await data.book.create({
    title: 'Godfather'
    author: 5
    publish_date: new Date()
    categories: [1,2],
  })

  response.json(book)
}
```

Calling this endpoint will result in adding object to database.

## Other Creation Methods

### firstOrCreate(attributes, values)

|Type|Name|Default|Description|
|---|---|---|---|
|object|attributes|null|Attributes used to match object|
|object|data|null|Data used to create record|

```JavaScript
// Get first book with title 'Godfather' or create it
// Second param holds additional data assigned to object
await data.book.firstOrCreate({title: 'Godfather'}, {created_by: 1})
```

### updateOrCreate(attributes, values)

|Type|Name|Default|Description|
|---|---|---|---|
|object|attributes|null|Attributes used to match object to update|
|object|data|null|Data used to update record|

```JavaScript
// Get first book with name 'Godfather' or create it
// Second param holds additional data assigned to object
await data.book.updateOrCreate({title: 'Godfather'}, {created_by: 1})
```

## Retrieving Objects

### Get all objects from class

To get a list of our books:

```JavaScript
await data.book.list()
```

### Get all objects with author equal Mario Puzo

```JavaScript
await data.book.where('author', 'Mario Puzo').list()
```

### Get an object by id

Find a specific book by its id:

```JavaScript
await data.book.find(id)
```

### Get first object matching query

```JavaScript
await data.book.where('category', 'Crime').first()
```

### Get an object with given IDs

```JavaScript
await data.book.find([4, 5, 10])
```

### Get an object with given ID or throw error

```JavaScript
await data.book.findOrFail(15)
```

### Get first object with pages > 100 or throw error

```JavaScript
await data.book.where('pages', '>', 100).firstOrFail())
```

## Retrieving Related Objects

```JavaScript
// Categories column ids will be replaced with objects from targeted class (category)
await data.book.with('categories').list()
```

// before 'with'
```JSON
{
  "id": 10,
  "title": "Little John",
  "categories": [25, 20],
  "author": 5
}

```

// after 'with'
```JSON
{
  "id": 10,
  "title": "Little John",
  "categories": [{
    "id": 25,
    "name": "horror"
  }, {
    "id": 20,
    "name": "thriller"
  }],
  "author": {
    "id": 5,
    "username": "adam"
  }
}
```

## Filtering

All filtered columns must have ```filter_index: true```

```YAML
classes:
  book:
    - name: title
      type: string
      filter_index: true
```

### Filtering Operators

Here you can find all the possible filter options for different types of Data Object fields:

|Operator|Description|Example|Suitable for|
|---|---|---|---|
|`=`|**Equal to**<br/>Checking if value is equal to provided|```await data.book.where('pages', '=', 500).list()``` <br/>**Note:** You can omit `=` to simply check if value is equal|`integer`, `float`, `boolean`, `string`, `datetime`|
|`<`|**Greater than**<br/>Checking if value is greater than provided|```await data.book.where('pages', '<', 500).list()```|`integer`, `float`, `string`, `datetime`|
|`<=`|**Greater than or equal to**<br/>Checking if value is greater or equal to provided|```await data.book.where('pages', '<=', 500).list()```|`integer`, `float`, `string`, `datetime`|
|`>`|**Less than**<br/>Checking if value is less than provided|```await data.book.where('pages', '>', 500).list()```|`integer`, `float`, `string`, `datetime`|
|`>=`|**Less than or equal to**<br/>Checking if value is less or equal to provided|```await data.book.where('pages', '>=', 500).list()```|`integer`, `float`, `string`, `datetime`|
|`!=`|**Not equal to**<br/>Checking if value is not equal to provided|```await data.book.where('pages', '!=', 500).list()```|`integer`, `float`, `boolean`, `string`, `datetime`|
|`in`|**In a given list**<br/>Checking if value of the field is on the provided list<br/>(list can contain up to 128 values)|```await data.book.where('year', 'in', [2001, 2002]).list()```|`integer`, `float`, `boolean`, `string`, `datetime`|
|`nin`|**Not in a given list**<br/>Checking if value of the field is on the provided list. If it is, it filters out matching objects (list can contain up to 128 values)|```await data.book.where('id', 'nin', [10, 20]).list()```|`integer`, `float`, `boolean`, `string`, `datetime`|

#### Get all books with title

```JavaScript
await data.book.whereNotNull('title').list()
```

#### Get all books without title

```JavaScript
await data.book.whereNull('title')
```

#### Get all books with pages between 200 and 400

```JavaScript
await data.posts.whereBetween('pages', 200, 400)
```

#### Get books with id between 100 and 200

```JavaScript
await data.book
  .where([
    ['id', '<', 100],
    ['id', '>', 200]
    ['status', 'published']
  ]).list()
```

#### Get books with number of pages lower than 100 or higher than 300

```JavaScript
await data.book
    .where('pages', '<', 100)
    .orWhere('pages', '>', 300)
    .list()
```

## Updating Objects

### update(id, data?)

|Type|Name|Default|Description|
|---|---|---|---|
|mixed|id|null|Id of object to update|
|object|data|null|Data used to update record|

### Update all objects

```JavaScript
await data.book.update({author: 'Mario Puzo'})
```

### Update single object with given ID

```JavaScript
await data.book.update(14, {title: 'The Sicilian'})
```

### Update multiple objects

```JavaScript
await data.book.update([
  [14, {author: 'Mario Puzo'}],
  [15, {author: 'Mario Puzo'}]
])
```

### Update all objects matching query

```JavaScript
await data.book
  .where('categories', 'in', ['horror', 'thriller'])
  .update({discount: 20})
```

## Deleting Objects

### delete(id)

|Type|Name|Default|Description|
|---|---|---|---|
|mixed|id|null|Id of object to delete|

### Delete single book using it's own specific ID:

```JavaScript
  await data.book.delete(ctx.args.id)
```

### Delete all books:

```JavaScript
  await data.book.delete()
```

### Delete multiple books:

```JavaScript
  await data.book.delete([55, 56, 57])
```

### Delete books where author id is equal to 15:

```JavaScript
await data.book.where('author', 15).delete()
```

## Rest of the Core methods:

### first()

```JavaScript
// Get first book
await data.book.first()
```

```JavaScript
// Get first published book
await data.book.where('status', 'published').first()
```

### firstOrFail()

```JavaScript
// Get first published book or throw exception
await data.book.where('status', 'published').firstOrFail()
```

### find(id)

|Type|Name|Default|Description|
|---|---|---|---|
|mixed|id|null|Id of object to find|

```JavaScript
// Get object by ID
await data.book.find(1)

// Get objects with given IDs
await data.book.find([4, 5, 10])
```

### findOrFail(id)

|Type|Name|Default|Description|
|---|---|---|---|
|mixed|id|null|Id of object to find|

```JavaScript
// Get object by ID or fail
await data.book.findOrFail(1)

// Get objects with given IDs or fail if at least one is missing
await data.book.findOrFail([4, 5, 10])
```

### where(column, operator?, value)

All filtered columns must have ```filter_index: true```

```YAML
classes:
  book:
    - name: title
      type: string
      filter_index: true
```

|Type|Name|Default|Description|
|---|---|---|---|
|mixed|column|null|Name of column being filtered|
|string|operator|'eq'|Operator used to filter|

```JavaScript
// Get all books with pages = 100
await data.book.where('pages', '=', 100).list()

// You can ommit second param to simply check if value is equal
await data.book.where('pages', 100).list()

// Get all books with pages greater than 100
// Other selectors: <, <=, >, >=, =, !=
await data.book.where('pages', '>', 100).list()

// Get all books with one of the categories
await data.book.where('categories', 'in', ['drama', 'romance']).list()

// Get all books with id not in given array
await data.book.where('id', 'nin', [10, 20]).list()

// Get all romance books with id between 100 and 200
await data.book
  .where([
    ['id', '>', 100],
    ['id', '<', 200]
    ['categories', 'romance']
  ]).list()
```

### orWhere(column, operator?, value)

|Type|Name|Default|Description|
|---|---|---|---|
|mixed|column|null|Name of column being filtered|
|string|operator|'eq'|Operator used to filter|
|mixed|value|null|Expected value|

```JavaScript
// Get books with pages lower than 100 or higher than 300
await data.book
  .where('pages', '<', 100)
  .orWhere('pages', '>', 300)
  .list()
```

### whereNull(column)

|Type|Name|Default|Description|
|---|---|---|---|
|string|column|null|Name of column being filtered|

```JavaScript
// Get books without title
await data.book.whereNull('title').list()
```

### whereNotNull(column)

|Type|Name|Default|Description|
|---|---|---|---|
|string|column|null|Name of column being filtered|

```JavaScript
// Get books with title
await data.book.whereNotNull('title').list()
```

### whereIn(column, arr)

|Type|Name|Default|Description|
|---|---|---|---|
|string|column|null|Name of column being filtered|
|array|arr|[]|Array of filtered values|

```JavaScript
// Get all books with category crime or biography
await data.book.whereIn('categories', ['crime', 'biography']).list()
```

### whereNotIn(column, arr)

|Type|Name|Default|Description|
|---|---|---|---|
|string|column|null|Name of column being filtered|
|array|arr|[]|Array of filtered values|

```JavaScript
// Get all books not having category of crime or biography
await data.book.whereNotIn('categories', ['crime', 'biography']).list()
```

### whereBetween(column, min, max)

|Type|Name|Default|Description|
|---|---|---|---|
|string|column|null|Name of column being filtered|
|mixed|min||Minimal value|
|mixed|max||Maximal value|

```JavaScript
// Get all books with pages between 200 and 400
await data.book.whereBetween('pages', 200, 400).list()

// Get all books created in last seven days
await data.book
  .whereBetween(
    'created_at', 
    new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    new Date().toISOString()
  ).list()
```

### with(relations)

|Type|Name|Default|Description|
|---|---|---|---|
|mixed|relations|null|Relations, references which should be eager loaded|

```JavaScript
// Get object with expanded author and all comments
await data.book.with('author', 'comments').list()

// You can also wrap arguments in array
await data.book.with(['author', 'comments']).list()
```

### orderBy(column, direction?)

> Columns used to sort must have ```order_index: true```

```YAML
classes:
  book:
    - name: title
      type: string
      order_index: true
```

|Type|Name|Default|Description|
|---|---|---|---|
|string|column|null|Column used to sort objects|
|string|direction|'asc'|In which direction objects shold be sorted|

```JavaScript
// Order books ascending by date
await data.book.orderBy('created_at').list()

// Order books descending by date
await data.book.orderBy('created_at', 'desc').list()
```

### skip(count)

|Type|Name|Default|Description|
|---|---|---|---|
|number|count|null|How many objects should be skipped|

```JavaScript
// Skip 10 first books and get the rest
await data.book.skip(10).list()
```

### take(count)

|Type|Name|Default|Description|
|---|---|---|---|
|number|count|null|How many objects should be returned|

```JavaScript
// Get only first 15 objects
await data.book.take(15).list()
```

### fields(columns)

|Type|Name|Default|Description|
|---|---|---|---|
|mixed|columns|null|Names of columns to whitelist|

```JavaScript
// Get books and filter out fields to id and title
await data.book
  .fields('id', 'title')
  .list()

// You can also change column names
await data.book
  .fields('id', 'user.username as author')
  .list()
```

### pluck(column)

|Type|Name|Default|Description|
|---|---|---|---|
|string|column|null|Column name of which values will be returned|

```JavaScript
// Get array of post ids
await data.book.pluck('id')
```

### value(column)

|Type|Name|Default|Description|
|---|---|---|---|
|string|column|null|Column name of which value will be returned|

```JavaScript
// Get first post and return it's id
await data.book.value('id')
```

### count()

```JavaScript
// Count all books
await data.book.count()

// Count books with given category
await data.book.where('categories', 'in', ['drama', 'horror']).count()
```

