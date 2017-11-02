# You can define following properties in a `socket.yml` file:

1. Language
2. Config
2. Endpoints
3. Classes
4. Channels
5. Events
6. Event Handlers
7. Sockets
8. Hosting

## Language

Language defines a programming language that is used in all the Socket scripts. Possible values are:
- `javascript`
- `python`

The default value is `javascript`.

## Config

A General configuration dictionary. Here you can store any configuration that is not socket specific. If you decide to store a config `VERY_SECRET` with a value `FOO` you could do it like so:

```yaml
config:
  VERY_SECRET:
    value: FOO
```
 It can be later accessed from every Socket Script within the current Instance with this code:

 ```javascript
 var secret = CONFIG.VERY_SECRET;

console.log(secret);
// FOO
```

## Endpoints

The most important part of the socket configuration file. This is where you'll define the socket API endpoints and connect them with underlying scripts.

### Source/File
When you define an endpoint, you can point to the script code by adding one of these properties:
- `source`
- `file`

#### Source
 Source allows you to embed the script code directly in the `socket.yml` file, like so:

 ```yaml
 endpoints:
  get_obj:
    source: |
      data.chat.get(id).return()
````

The `data.chat.get(id).return()` is a script code that will get executed when the `get_object` endpoint is called. The script code defined this way can span across multiple lines of the config file.

#### File
While the `source` method is great for one-liners, it might get cumbersome with more sophisticated script code. That's why the recommended way of passing the script code into endpoints is with `file` property:

```yaml
endpoints:
  get_obj:
    file: ./scripts/get_obj.js
```

`file` value is a relative path to the file containing the script code. The`socket.yml` location is the root.

### Separation by HTTP methods

By default, an endpoint will execute the same script on any type of HTTP request. There's an option to separate the request by `GET`, `POST`, `PUT`, `PATCH` and `DELETE`. This way the same endpoint might execute different scripts depending on an HTTP method:

```yaml
endpoints:  
  endpoint_separate_by_http_method:
    GET:
      file: ./scripts/get_obj.js
    POST:
    	file: ./scripts/create_object.js
```

### Endpoint documentation
Since the yml file will accept any property, you can add your own notes to any part of the specification file. In case you would like your socket to be a part of Syncano Sockets Registry, you'll be required to document the socket endpoints in the following manner:

```yaml
endpoints:
  send_email:
    file: ./scripts/send_email.js
    parameters:
      email:
        type: string
        description: Email of the recipient
        example: "hulk@hogan.net"
    response:
      mimetype: application/json
      examples:
        - exit_code: 200
          description: "Email sent successfully"
          example: |
          {
            "email_id": 320
          }
        - exit_code: 400
          description: "Error while sending email"
          example: |
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
     parameters:
       - recipient
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
  	file: ./event_handlers/data.cars.create.js
```

## Sockets
Sockets can be added to Syncano in 3 ways:

#### 1. The Syncano Socket Registry
This will be the most common situation. A user searches for a socket by the `syncano-cli search` command and add it with `syncano-cli add <socket_name>`. Socket installed this way will have the following properties:

```yaml
mailing:
      version: 0.1
      src: syncano-socket-mailing
```

The `src` which stands for source is a socket name as listed in the Syncano Registry

#### 2. Github repository
A Syncano User can also install Sockets that are not available int the Sockets Registry. One of the options is an installation from a Github repository. In this case, the `src` points to the `socket.yml` file from the repository:

The URL should point to a **raw** version of the `socket.yml` file! See the URL below.

```yaml
mailing:
      version: 0.1
      src: https://raw.githubusercontent.com/eyedea-io/syncano-socket-countries/master/socket.yml
```

### 3.File
You can also install sockets directly from your machine. In this case, the `src` value will be the file path of the socket.yml file:

```yaml
mailing:
      version: 0.1
      src: ./mailing/socket.yml
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

The above example uses `production` and `staging` as hosting names, but the naming is arbitrary. `src` should point to a folder with your website build and cname (optional) would be the domain name that the hosting should point to.

Please see [Hosting documentation] to learn more about storing your web assets on Syncano.
