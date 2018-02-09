# Syncano Data Classes

## Overview

**Data Classes** are templates for data objects you want to store on Syncano. In order to be able to [add Data Objects], you have to define a **Data Class** for that type of data object. To [create a Data Class] you have to provide:

- The name of the class
- A description (optional)
- A schema

## Data Class Schema Fields

Each Data Class you create can have many different types of fields. These "fields" are properties that each Data Object inside this Data Class will contain, with `empty` as a default.

Let's say you have a `person` Data Class. Each `person` data object can have a `name`, `age`, or maybe `height` field. You could also add a `photo` field for them. Each of those properties will be a field in the schema of that data class.

### Data Class Schema

The `Data Class Schema` is the set of fields you would like to use in a Data Object. Syncano Classes are defined through socket.yml. Below we have an example list for the `Data Class Schema` of a `book` class.

```json
classes:
  book:
    - name: book_title
      type: string
    - name: publish_date
      type: datetime
    - name: total_pages
      type: integer
    - name: non-fiction
      type: boolean
    - name: author
      type: reference
      target: author
```

The `name` is the name of the field, and `type` is what kind of field it is such as `string`, `integer`, or even `file`! You'll also notice `target`. This field is actually a reference or relation to another Data Class.

### Types of Data Class Schema Fields

The following types of fields are supported in data class schema:

|Field type|Description|Example|
|---|---|---|
|string|text field limited to 128 chars|*This is my short book description.*|
|text|text field limited to 32000 chars|*This is my books long description... and it can be a very long string.*|
|integer|number field|1337|
|float|floating point field|*2.25*|
|boolean|boolean field|*true* or *false*
|datetime|date in UTC format|2015-02-22T05:09:244327Z|
|file|binary data, max 128MB|_Images, JSON, etc._|
|reference|reference to Data Object (related Data Object ID)|65356|
|array|array field of string types, int, boolean and float|*[1, 2, 3, 4]*|
|object|object field - JSON like|*{"attributeA": "A", "attributeB": "B", }*|
|geopoint|geographic coordinates field|Valid ranges: <br/>Latitude: -89 to 89 <br/>Longitude -179 to 179|
|relation|reference to Data Objects (related to more than one Data Object ID)|*12312, 3213, 8422*|
