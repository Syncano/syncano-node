# Real-time chat

- Preparation: **10 minutes**
- Requirements:
  - Initiated Syncano project
  - Basic understanding of JS, HTML & CSS
  - How Socket works in Syncano

### Problem to solve

You want to build simple real-time chat.

### Solution

### Create instance and Socket

  You must add to your project Syncano cli and create instance.
  
  ```bash
    npm install @syncano/cli
    npx s init
  ```

  Now you are ready to create new Socket.

  ```bash
    npx s create chat
  ```

### Create real-time channel

We must declare 2 Sockets.

First one for sending messages. Second to listen for new messages.

It should look like this:

  ```yaml
  #syncano/chat/syncano.yaml
    name: chat
    description: Description of chat
    runtime: nodejs_v8
    keywords:
      - chat

    endpoints:
      sendMessage:
        properties:
          message:
            type: string
            description: Send message
            examples:
              - Hello!!
      globalChannel:
        channel: global-message
  ```

  In your Socket to send message you must declare: 
  
  ``` js
    channel.publish('<channel_name>', message_to_send)
  ```

  ```js
  //syncano/chat/src/sendMessage.js
    import Syncano from '@syncano/core'

    export default (ctx) => {
      const {channel} = new Syncano(ctx)
      const {args} = ctx

      channel.publish("global-message", args)
    }
  ```

### Create client

Ok, now you're ready to listen on created channel in your project.

You must import Syncano client to your project
```html
  <script src="https://unpkg.com/@syncano/client@latest/dist/index.js"></script>
```

``` html
<!-- index.html -->
  <!DOCTYPE html>
  <html lang="en" dir="ltr">
    <head>
      <meta charset="utf-8">
      <title>chat</title>
      <link rel="stylesheet" type="text/css" href="styles.css">
    </head>
    <body>
      <ul>
      </ul>
      <form>
        <input></input>
        <button>Send</button>
      </form>
    </body>
    <script src="https://unpkg.com/@syncano/client@latest/dist/index.js"></script>
    <script src="./scripts.js"></script>
  </html>
```

```js
// script.js

  // Create new connection to your instance
  const syncano = new SyncanoClient('<YOUR_SYNCANO_INSTANCE_NAME>');

  const form = document.querySelector('form');
  const mesagesContainer = document.querySelector('ul');

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Post to your send message Socket with content 
    syncano.post("chat/sendMessage", {message: e.target[0].value});
    e.target[0].value = '';
  })

  // Listen on Socket with your channel 
  syncano.listen('chat/globalChannel')
    .addEventListener('message', message => {
      // In payload we hold received message
      const {payload} = JSON.parse(message.data);

      // Create new html tag and inject message content to it
      const mess = document.createElement('li');
            mess.innerHTML = payload.message;

      // Create new li with recived message in html ul
      mesagesContainer.appendChild(mess);
      // Scroll your messages container to bottom 
      mesagesContainer.scrollTop = mesagesContainer.scrollHeight;
    })
```
