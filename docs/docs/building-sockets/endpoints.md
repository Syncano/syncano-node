# Socket Endpoints
The is the most important part of the Syncano Socket configuration file. This is where you'll define the Socket API endpoints you will use in your app, and connect them with the underlying scripts that power them.

## Scripts

When you define an endpoint, Syncano will assume that there's a script in the `./src` with the
same name. So with an endpoint defined this way:

```yaml
endpoints:
  create_internets_now:
    parameters: ...
```

Syncano will run a `./src/create_internets_now.js` script.

Alternatively, you can point to the script code by adding one of these properties:
- `source`
- `file`

`Source` allows you to embed the script code directly in the `socket.yml` file, like so:

```yaml
 endpoints:
  get_obj:
    source: |
      data.chat.get(id).return()
```

The `data.chat.get(id).return()` is a script code that will get executed when the `get_obj` endpoint is called. The script code defined this way can span across multiple lines of the config file.

With the `file` property, you can define an alternative path for your script:

```yaml
endpoints:
  get_obj:
    file: ./src/different_than_endpoint_name.js
```

`file` value is a relative path to the file containing the script code. The `socket.yml` location is the root.

## Private endpoints

By default, endpoints are public, which means that anyone can execute the underlying script. To change this setting add a `private: true` param to the endpoint definition:

```yaml
endpoints:
  restricted:
    private: true
```

## Caching

You can allow for caching the GET requests to your endpoints. Add a cache property to the endpoint definition to enable caching:

```yaml
endpoint:
  i_will_be_cached:
    cache: 5
```

Now, the response from `i_will_be_cached` endpoint will be cached for `5 seconds`.

> valid cache property values are in a 0-1800 range with a floating point precision.

The cache property can be ignored on the client side. To do that, add `__skip_cache=1` query param to the GET request:

```js
s.get('socket/with_cache', { '__skip_cache': 1 })
```

Endpoints with this parameter, will be accessible with an account key only. They are suitable for hiding away Socket settings and configuration options. End users of your app won't have access to them.
