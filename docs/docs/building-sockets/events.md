# Events

Events section of the `socket.yml` file is meant to document the events emitted by the Socket scripts. So, if one of your scripts emits the following event:

```javascript
events.emit('email_sent', { recipient: email })
```

It can be documented in the `socket.yml` in this manner:

```yaml
events:
  email_sent:
     description: Emitted when e-mail is sent
     parameters:
       recipient:
        type: string
        description: Recipient email address
        example: email@address.com
```
