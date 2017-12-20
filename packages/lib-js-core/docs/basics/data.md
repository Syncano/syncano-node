# Data

With `data` method you're able to:

- Create, update, delete and list records from Syncano Classes

# Import

```js
const {data} = new Server(ctx)
```

# Methods

| Name                                               | Description                                                                |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| [create](#createdata)                              | Save a new object and return the instance                                  |
| [update](#updateid-data)                           | Update the object in the database                                          |
| [updateOrCreate](#updateorcreateattributes-values) | Create or update a record matching the attributes, and fill it with values |
| [delete](#deleteid)                                | Delete the object from the database                                        |
| [list](#list)                                      | List objects matching query                                                |
| [first](#first)                                    | Get first object matching query or return null                             |
| [firstOrFail](#firstorfail)                        | Get first object matching query or throw error                             |
| [firstOrCreate](#firstorcreateattributes-values)   | Get the first record matching the attributes or create it                  |
| [find](#findid)                                    | Find a object by its primary key                                           |
| [findOrFail](#findorfailid)                        | Find a object by its primary key or throw an exception                     |
| [where](#wherecolumn-operator-value)               | Add a basic where clause to the query                                      |
| [orWhere](#orwherecolumn-operator-value)           | Add OR clause to the query                                                 |
| [whereNull](#wherenullcolumn)                      | Filter columns with value of null                                          |
| [whereNotNull](#wherenotnullcolumn)                | Filter objects where column value is not null                              |
| [whereIn](#whereincolumn-arr)                      | Filter by existence in given array                                         |
| [whereNotIn](#wherenotincolumn-arr)                | Filter out objects not existing in given array                             |
| [whereBetween](#wherebetweencolumn-min-max)        | Filter objects where column is between given values                        |
| [with](#withrelations)                             | Being querying a object with eager loading                                 |
| [orderBy](#orderbycolumn-direction)                | Add an "order by" clause to the query                                      |
| [skip](#skipcount)                                 | Skip given number of results and return the rest                           |
| [take](#takecount)                                 | Take given number of results                                               |
| [fields](#fieldscolumns)                           | Whitelist returned fields                                                  |
| [pluck](#pluckcolumn)                              | Return array of values for single column                                   |
| [value](#valuecolumn)                              | Return column value of first object matching query                         |
| [count](#count)                                    | Return number of objects matching query                                    |

## `create(data)`

| Type   | Name | Default | Description                |
| ------ | ---- | ------- | -------------------------- |
| object | data | null    | Data used to create record |

```js
// Create single post
data.post.create({title: 'Lorem ipsum'})

// Create multiple posts
data.post.create([
  {title: 'Lorem ipsum 1'},
  {title: 'Lorem ipsum 2'}
])
```

## `update(id, data?)`

| Type   | Name | Default | Description                |
| ------ | ---- | ------- | -------------------------- |
| mixed  | id   | null    | Id of object to update     |
| object | data | null    | Data used to update record |

```js
// Update all objects
data.post.update({title: 'Lorem ipsum 1'})

// Update single object with given ID
data.post.update(14, {title: 'Lorem ipsum 1'})

// Update multiple objects
data.post.update([
  [14, {title: 'Lorem ipsum 1'}],
  [15, {title: 'Lorem ipsum 1'}]
])

// Update all objects matching query
data.post
  .where('status', 'in', ['draft', 'deleted'])
  .update({title: 'Lorem ipsum 1'})
```

## `updateOrCreate(attributes, values)`

| Type   | Name       | Default | Description                               |
| ------ | ---------- | ------- | ----------------------------------------- |
| object | attributes | null    | Attributes used to match object to update |
| object | data       | null    | Data used to update record                |

```js
// Get first tag with name 'ship' or create it
// Second param holds additional data assigned to object
data.tag.updateOrCreate({name: 'ship'}, {created_by: 1})
```

## `delete(id)`

| Type  | Name | Default | Description            |
| ----- | ---- | ------- | ---------------------- |
| mixed | id   | null    | Id of object to delete |

```js
// Delete all posts
data.post.delete()

// Delete signle post with given ID
data.post.delete(55)

// Delete multiple posts
data.post.delete([55, 56, 57])

// Delee all posts where draft column is equal 1
data.post.where('draft', 1).delete()
```

## `list()`

```js
// Get all objects from class
data.post.list()

// Get all objects with status equal published
data.post
  .orderBy('created_at', 'DESC')
  .where('status', 'published')
  .list()
```

## `first()`

```js
// Get first post
data.post.first()

// Get first draft post
data.post.where('status', 'draft').first()
```

## `firstOrFail()`

```js
// Get first draft post or throw exception
data.post.where('status', 'draft').firstOrFail()
```

## `firstOrCreate(attributes, values)`

| Type   | Name       | Default | Description                     |
| ------ | ---------- | ------- | ------------------------------- |
| object | attributes | null    | Attributes used to match object |
| object | data       | null    | Data used to create record      |

```js
// Get first tag with name 'ship' or create it
// Second param holds additional data assigned to object
data.tag.firstOrCreate({name: 'ship'}, {created_by: 1})
```

## `find(id)`

| Type  | Name | Default | Description          |
| ----- | ---- | ------- | -------------------- |
| mixed | id   | null    | Id of object to find |

```js
// Get object by ID
data.posts.find(1)

// Get objects with given IDs
data.posts.find([4, 5, 10])
```

## `findOrFail(id)`

| Type  | Name | Default | Description          |
| ----- | ---- | ------- | -------------------- |
| mixed | id   | null    | Id of object to find |

```js
// Get object by ID or fail
data.posts.findOrFail(1)

// Get objects with given IDs or fail if at least one is missing
data.posts.findOrFail([4, 5, 10])
```

## `where(column, operator?, value)`

All filtered columns must have `filter_index: true`:

```yaml
classes:
  posts:
    - name: title
      type: string
      filter_index: true
```

| Type   | Name     | Default | Description                   |
| ------ | -------- | ------- | ----------------------------- |
| mixed  | column   | null    | Name of column being filtered |
| string | operator | 'eq'    | Operator user to filter       |
| mixed  | value    | null    | Expected value                |

```js
// Get all posts with views = 100
data.posts.where('views', '=', 100).list()

// You can ommit second param to simply check if value is equal
data.posts.where('views', 100).list()

// Get all post with views greater than 100
// Other selectors: <, <=, >, >=, =, !=
data.posts.where('views', '>', 200).list()

// Get all posts with one of the statuses
data.posts.where('status', 'in', ['draft', 'published']).list()

// Get all posts with id not in given array
data.posts.where('id', 'nin', [10, 20]).list()

// Get all published posts with id between 100 and 200
data.posts
  .where([
    ['id', 'gt', 100],
    ['id', 'lt', 200]
    ['status', 'published']
  ]).list()
```

## `orWhere(column, operator?, value)`

| Type   | Name     | Default | Description                   |
| ------ | -------- | ------- | ----------------------------- |
| mixed  | column   | null    | Name of column being filtered |
| string | operator | 'eq'    | Operator user to filter       |
| mixed  | value    | null    | Expected value                |

```js
// Get posts with views counter lower than 100 or higher than 1000
data.posts
  .where('views', '<', 100)
  .orWhere('views', '>', 1000)
  .list()
```

## `whereNull(column)`

| Type   | Name     | Default | Description                   |
| ------ | -------- | ------- | ----------------------------- |
| string | column   | null    | Name of column being filtered |

```js
// Get posts without title
data.posts.whereNull('title').list()
```

## `whereNotNull(column)`

| Type   | Name     | Default | Description                   |
| ------ | -------- | ------- | ----------------------------- |
| string | column   | null    | Name of column being filtered |

```js
// Get posts with title
data.posts.whereNotNull('title').list()
```

## `whereIn(column, arr)`

| Type   | Name     | Default | Description                   |
| ------ | -------- | ------- | ----------------------------- |
| string | column   | null    | Name of column being filtered |
| array  | arr      | []      | Array of filtered values      |

```js
data.posts.whereIn('status', ['draft', 'deleted']).list()
```

## `whereNotIn(column, arr)`

| Type   | Name      | Default | Description                                        |
| ------ | --------- | ------- | -------------------------------------------------- |
| string | column    | null    | Name of column being filtered                      |
| array  | arr       | []      | Array of filtered values                           |

```js
// Get all not published or draft posts
data.posts.whereNotIn('status', ['published', 'draft']).list()
```

## `whereBetween(column, min, max)`

| Type   | Name      | Default | Description                                        |
| ------ | --------- | ------- | -------------------------------------------------- |
| string | column    | null    | Name of column being filtered                      |
| mixed  | min       |         | Minimal value                                      |
| mixed  | max       |         | Maximal value                                      |

```js
// Get all posts with views between 100 and 1000
data.posts.whereBetween('views', 100, 1000).list()

// Get all posts created in last seven days
data.posts
  .whereBetween(
    'created_at', 
    new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    new Date().toISOString()
  ).list()
```

## `with(relations)`

| Type  | Name      | Default | Description                                        |
| ----- | --------- | ------- | -------------------------------------------------- |
| mixed | relations | null    | Relations, references which should be eager loaded |

```js
// Get object with expanded author and all comments
data.posts.with('author', 'comments').list()

// You can also wrap arguments in array
data.posts.with(['author', 'comments']).list()
```

## `orderBy(column, direction?)`

Columns used to sort must have `order_index: true`:

```yaml
classes:
  posts:
    - name: title
      type: string
      order_index: true
```

| Type   | Name      | Default | Description                                 |
| ------ | --------- | ------- | ------------------------------------------- |
| string | column    | null    | Column used to sort objects                 |
| string | direction | 'asc'   | In which direction objects shold be sorted. |

```js
// Order posts ascending by date
data.posts.orderBy('created_at').list()

// Order posts descending by date
data.posts.orderBy('created_at', 'desc').list()
```

## `skip(count)`

| Type   | Name  | Default | Description                       |
| ------ | ----- | ------- | --------------------------------- |
| number | count | null    | How many object should be skipped |

```js
// Skip 10 first posts and get the rest
data.posts.skip(10).list()
```

## `take(count)`

| Type   | Name  | Default | Description                 |
| ------ | ----- | ------- | --------------------------- |
| number | count | null    | How many object be returned |

```js
// Get only first 15 objects
data.posts.take(15).list()
```

## `fields(columns)`

| Type  | Name    | Default | Description                   |
| ----- | ------- | ------- | ----------------------------- |
| mixed | columns | null    | Names of columns to whitelist |

```js
// Get all posts. Result will be array of objects with keys: id, title.
data.posts
  .fields('id', 'title')
  .list()

// You can also change column names
data.posts
  .fields('id', 'user.first_name as author')
  .list()
```

## `pluck(column)`

| Type   | Name   | Default | Description                                  |
| ------ | ------ | ------- | -------------------------------------------- |
| string | column | null    | Column name of which values will be returned |

```js
// Get array of post ids
data.posts.pluck('id')
```

## `value(column)`

| Type   | Name   | Default | Description                                 |
| ------ | ------ | ------- | ------------------------------------------- |
| string | column | null    | Column name of which value will be returned |

```js
// Get first post and return it's id
data.posts.value('id')
```

## `count()`

```js
// Count all posts
data.posts.count()

// Count posts with given status
data.posts.where('status', 'in', ['draft', 'deleted']).count()
```
