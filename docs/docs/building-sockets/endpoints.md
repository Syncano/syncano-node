# Socket Endpoints
The is the most important part of the Syncano Socket configuration file. This is where you'll define the Socket API endpoints you will use in your app, and connect them with the underlying scripts that power them.

## Scripts

When you define an endpoint, you can point to the script code by adding one of these properties:
- `source`
- `file`

`Source` allows you to embed the script code directly in the `socket.yml` file, like so:

```yaml
 endpoints:
  get_obj:
    source: |
      data.chat.get(id).return()
```

The `data.chat.get(id).return()` is a script code that will get executed when the `get_object` endpoint is called. The script code defined this way can span across multiple lines of the config file.

While the `source` method is great for one-liners, it might get cumbersome with more sophisticated script code. That's why the recommended way of passing the script code into endpoints is with `file` property:

```yaml
endpoints:
  get_obj:
    file: ./scripts/get_obj.js
```

`file` value is a relative path to the file containing the script code. The `socket.yml` location is the root.

## Channels

Real-Time Channels are a way of providing real-time publish/subscribe functionality in Syncano.

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

## Documentation
Since the yaml file will accept any property, you can add your own notes to any part of the specification file. In case you would like your Socket to be a part of Syncano Sockets Registry, you'll be required to document the Socket endpoints in the following manner:

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
