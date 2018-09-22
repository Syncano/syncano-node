# You can define following properties in a `socket.yml` file:

1. Config
2. Endpoints
3. Classes
4. Channels
5. Events
6. Event Handlers
7. Hosting

## Config

A General configuration dictionary. Here you can store any configuration that is not socket specific. If you decide to store a config `MY_API_KEY` with a value `FOO` you could do it like so:

```yaml
config:
  API_KEY:
    description: API key to external service
    required: true
```
 It can be later accessed from every Socket Script within the current Instance with this code:

 ```javascript
 var secret = CONFIG.VERY_SECRET;

console.log(secret);
// FOO
```

## Endpoints

The most important part of the Socket configuration file. This is where you'll define the Socket API endpoints and connect them with underlying scripts.

```yaml
endpoints:
  get_obj:
    description: My script to get objects
```

In that case file located in `<endopoint folder>/src/get_obj.js` as a default one.
You can override it by setting up `file` property:

```yaml
endpoints:
  get_obj:
    description: My script to get objects
    file: get_objects.js
```

`<endopoint folder>/src/get_objects.js` will be used in this case.


### Endpoint documentation
Since the YAML file will accept any property, you can add your own notes to any part of the specification file. In case you would like your socket to be a part of Syncano Sockets Registry, you'll be required to document the socket endpoints in the following manner:

```yaml
endpoints:
  send_email:
    file: send_email.js
    inputs:
      properties:
        email:
          type: string
          description: Email of the recipient
          example: "hulk@hogan.net"
    outputs:
      success:
        description: Email sent successfully
        examples:
          - |
            {
              "email_id": 320
            }
      fail:
        exit_code: 400
        description: Error while sending email
        examples:
          - |
            {
              "reason": "Internal error!"
            }
```

|Documentation Property|Description|
|---|---|
|`parameters`|Describes the arguments accepted by an endpoint. The parameters documentation should consist of `type`, `description` and `example` fields.|
|`response`|Describes the endpoints' responses in the `examples` property. `examples` is an array of possible responses with appropriate `exit_code`, `description` and response `example`. Optionally, a `mimetype` defining a response type can be added.|

## Channels

Real-Time Channels are a way of providing real-time messaging/chat functionality in Syncano.

In the configuration, they are part of the endpoints section. A user can either subscribe to messages on a certain channel or publish them:

```yaml
endpoints:
# Publish to channel that is built from current user's username automatically by library.
 	publish: |
      channels.publish("channel.{user}", {message: "Hello!"})
# Subscriptions to channels are open but can be based on current user (like in this example).
  subscribe:
      channel: channel.{user}
```

Read the Real-Time Channels documentation to learn more about the real-time capabilities of Syncano.

## Classes

Classes section allows you to specify the type of Data Objects you'd want to store within your Instance. In case you'd like to extend a Class with new properties, you can simply add them to a Class that was already configured in a `socket.yml`. Also, removing a Class from `socket.yml` will result in its deletion from an instance. Changes will be applied when running `syncano-cli deploy` command.

Example Class might be represented as follows:

```yaml
classes:
  posts:
    - name: title
      type: string
      filter_index: true
    - name: body
      type: text
```

If you'd like to learn more about defining Classes, please refer to the [Data Classes] Section of this documentation.

## Events

Events section of the socket.yml file is meant to document the events emitted by the socket scripts. So, if one of your scripts emits the following event:

```javascript
events.emit("email_sent", { recipient: email })
```

It can be documented in the socket.yml in this manner:

```yaml
events:
  email_sent:
     description: "Emitted when e-mail is sent"
```

## Event Handlers

Event handlers are a way to define asynchronous scripts that handle either user-defined or built-in events, including scheduling of some actions to run periodically.

Possible Event Handler types are:

|Event Handler|Description|
|---|---|
|`data.<class>.<create/update/delete>` |built-in events for classes|
|`schedule.interval.5_minutes`|built-in events for interval script runs|
|schedule.crontab.*/5 * * * *|built-in events for scheduled script runs with *cron* |
|`events.<name of custom event>`|user-defined event|

For example, if I wanted a script to be run after a Data Object is created in `cars` class, I would add following configuration into the socket.yml:

```yaml
event_handlers:
	data.cars.create:
  	file: data.cars.create.js
```

## Hosting

A Hosting section allows you to specify the configuration of your web assets:

```yaml
hosting:
  production:
    description: Production
    cname: website.com
    src: ./build-production
  staging:
    description: Staging
    cname: staging.website.com
    src: ./build-staging
```

The above example uses `production` and `staging` as hosting names, but the naming is arbitrary. `src` should point to a folder with your website build and CNAME (optional) would be the domain name that the hosting should point to.

Please see [Hosting documentation] to learn more about storing your web assets on Syncano.
