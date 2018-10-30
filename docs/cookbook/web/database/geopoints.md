# GeoPoints

- Preparation: **20 minutes**
- Requirements:
  - Initiated Syncano project

### Problem to solve

Example problems that can be solved with the usage of geopoints:
- Measuring and updating the distance between two users.
- Listing places (restaurants, cinemas) within a given radius

### Solution

Create a Data Class with a GeoPoint schema field type along with two endpoints: one for saving the geolocation data and one for querying it.

#### Creating a Data Class with a GeoPoint field

In order to be able to use the GeoPoints functionality, you'll need a Data Class with a GeoPoint schema field type. You'll also need to add a filtering index to this field if you'd like to make GeoPoint based queries. You can add one filtering index to GeoPoint fields per Data Class.

To save the data, create a `save-location` endpoint. It will serve as a gateway for writing the coordinates to your `geolocation` class.

```YAML
name: geolocation

classes:
  geolocation:
    - name: coordinates
      type: geopoint
      filter_index: true
    - name: user
      type: reference
      target: user

endpoints:
  save-location:
    description: User coordinates fetched from the browser
    inputs:
      properties:
        coordinates:
          description: Latitude, longitude plus optional distance_in_kilometers or distance_in_miles
          type: object
    outputs:
      success:
        exit_code: 200
        examples: |
           {
             "message": "location saved"
           }
      fail:
        exit_code: 404
        description: Failed
        examples: |
           {
             "message": Something went wrong!"
           }
  get-near-location:
    description: Gets Data Objects in range of the provided geolocation data
    inputs:
      required:
      - coordinates    
    properties:
      coordinates:
        description: latitude, longitude plus optional distance_in_kilometers or distance_in_miles
        type: object
    outputs:
      success:
        exit_code: 200
        description: returns a list of Data Objects matching the provided range
      fail:
        exit_code: 404
```

> - `filter_index` will be needed if you want to make geolocation queries
- I've added a user class as a reference since this would be the most common use case - to store geographic coordinates of your users. This is optional.

The geopoint schema field is an object that contains three properties - `type`, `latitude`, `longitude`:

```json
  "coordinates": {
      "type": "geopoint",
      "latitude": -30.0,
      "longitude": 23.0
  }
```

#### Creating Data Objects with GeoPoint fields

Once you have added the GeoPoint field type to your Data Class, you can start creating Data Objects with geolocation data. If you named your GeoPoint field as `coordinates`, the `save-location.js` script file would look like this:

```js
import Syncano from '@syncano/core'

export default async (ctx) => {
  const { data, response } = new Syncano(ctx)
  const { latitude, longitude } = ctx.args
  const { user } = ctx.meta

  if(!user) {
      return response.json('No such user', 401)
  }

  try {
    // To store only one geolocation Data Object per user, you can use `updateOrCreate`
    // method. To keep all the past info we would simply `create` a new object
    // each time a user sends his geolocation data
    const createdGeoPoint = await data.geolocation.updateOrCreate({user: user.id}, {
      coordinates: { latitude, longitude },
      user: user.id
    })

    return response.json(createdGeoPoint)
  } catch (err) {
    return response.json(err, err.status || 404)
  }
}

```

> When creating GeoPoints you should remember that the valid ranges for the coordinates are:
- Latitude: -89 to 89
- Longitude -179 to 179

> You can create coordinates with a 13 digit precision after decimal point.


That's it when it comes to creating Data Objects with GeoPoint fields. What you would probably like to know is how to make all those cool coordinate queries, so here it is.

#### Making GeoPoint queries

There are two ways of filtering the results based on spacial coordinates. You can query if objects are `near` a given range or wether a geopoint data `exists` for a particular key.

##### The `near` query

Making a near query will return all the objects that are within the given range.

> Default distance in near query is 100 miles
> Maximal distance is either 40075km or 24901miles (length of the equator).

This is how an example script doing the `near` lookup would look like:

```js
import Syncano from '@syncano/core'

export default async (ctx) => {
  const { data, response } = new Syncano(ctx)
  const { latitude, longitude } = ctx.args

  try {
    const result = await data.geolocation.where('coordinates', 'near',
    { latitude, longitude }).list()

    return response.json(result)
  } catch (err) {
    return response.json(err, err.status || 404)
  }
}
```

> You can also add `distance_in_kilometers` or `distance_in_miles` as a query param.
Then, the third param object will have an extra argument:

```js
data.geolocation.where('coordinates', 'near', {
  latitude,
  longitude,
  distance_in_kilometers: 200 // or distance_in_miles
}).list()
```

##### The `exists` query

You can also check if the specified geopoint field has any coordinates data. This is how such a lookup would look like:

```js
data.geolocation.where('coordinates', 'exists', true).list()
// or to return the coordinates that have no data
data.geolocation.where('coordinates', 'exists', false).list()
```

That's all about the GeoPoints. We hope you'll find them useful!
