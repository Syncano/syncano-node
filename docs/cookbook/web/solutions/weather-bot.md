# Facebook Weather Bot

- Preparation: **6 minutes**
- Requirements:
  - Initiated Syncano project
  - OpenWeatherMap API key
  - Facebook App Page Token
- Sockets:
  - [openweathermap](https://www.npmjs.com/package/@eyedea-sockets/openweathermap)
  - [messenger-bot](https://www.npmjs.com/package/@eyedea-sockets/messenger-bot)

### Problem to solve

You want to build simple Messenger bot for a Facebook page which can give you forecast for the next 3 hours for a particular city.

### Solution

Our solution is based on two Sockets. [openweathermap](https://www.npmjs.com/package/@eyedea-sockets/openweathermap) Socket will be used to get weather data from [OpenWeatherMap](https://openweathermap.org/) service using their API. [messenger-bot](https://www.npmjs.com/package/@eyedea-sockets/messenger-bot) will be used for communication with Facebook. On top of that, we will create a `responder` Socket which will connect those two functionalities.


#### Installing dependencies

To install `openweathermap` Socket type:
```sh
$ npm install @eyedea-sockets/openweathermap
```
Deploy openweathermap Socket

```sh
npx s deploy openweathermap
```

Now you have to provide API key for the OpenWeatherMap Service:
```
    Socket openweathermap (0.0.11) has been added to the config file.

?   OpenWeatherMap API key (APP_ID)
    To find the API key, go to your OpenWeatherMap account and copy it from
    API keys section at (https://home.openweathermap.org/api_keys).

    Type in value: bf0a7ccf140879bc0098a85f3b8b2c94
    Your socket is ready to use! Type npx s socket list openweathermap to see docs.
```



To install `messenger-bot` Socket type:
```sh
$ npm install @eyedea-sockets/messenger-bot
```

Deploy messenger-bot Socket

```sh
npx s deploy messenger-bot
```

To properly configure the Socket you will need create Facebook Page and Facebook Application.
Then you have to provide `Page Token`, follow the instructions to get it from Facebook developer portal:
```
    Socket messenger-bot (0.0.21) has been added to the config file.

?   Facebook App Page Token (FACEBOOK_APP_TOKEN)
    To find the token, go to the 'Messenger > Settings > Token Generation' section in your Facebook Application settings panel at https://developers.facebook.com.

    Type in value: EAAbvRMZClZC4YBAL63OHJLSMWwbSKg9BM1eojt2VU0fv95vkgURMjqDqKPUVZCuN3HjNE8fjt2TJfK8Jt68fwVAAltb8JnQjgpcbMHF9eqh2OiH4ZC0ftsJz3h5ZA7wKOWacDOQGte9b9Lhl3KKuvdrJJhIgjZAAeXKgUXmSkEdgZDZD
    Your socket is ready to use! Type `npx s socket list` messenger-bot to see list of endpoints.
```

#### Creating a "responder" Socket

Now we are ready to send/receive messages from Facebook Messenger and collecting weather data from OpenWeatherMap.

We need to only create a logic which will be responsible for the data flow:
  - receive a message from Messenger
  - ask OpenWeatherMap for the forecast for given city name
  - respond with the nice looking text about the weather forecast

We will create a new Socket called `responder`:

```sh
$ npx s create responder
```

Choose a template for your Socket (ES6 Socket template):
```
?
      Vanilla JS Socket - (@syncano/template-socket-vanilla)
  ❯   ES6 Socket - (@syncano/template-socket-es6)
      ES6 Socket + validation - (@syncano/template-socket-es6-validate)

```

#### Building logic of the "responder" Socket

First thing is to catch an event about the received message, to do that we have to add an event handler to the Socket config file (syncano/responder/socket.yml):

```yaml
event_handlers:
  events.messenger-bot.message-received:
    description: Handling requests from FB
    file: responder.js
```

You socket config file (`socket.yml`) should now look like this:

```yaml
name: responder
description: Description of responder
version: 0.0.1

event_handlers:
  events.messenger-bot.message-received:
    description: Handling requests from FB
    file: responder.js
```
In src folder rename hello.js to responder.js and paste in the following code:

```javascript
import Syncano from '@syncano/core'

export default async ctx => {
  const {event, endpoint} = new Syncano(ctx)
  const {text, sender} = ctx.args

  if (text.toLowerCase().indexOf('hello') >= 0) {
    event.emit('messenger-bot.message-send', {text: `Hi, this is Syncano Weather bot 😎 
To check the weather, please type your city name in your message ie. Oslo  `, sender} )
  } else if (text.toLowerCase().indexOf('help') >= 0) {
    event.emit('messenger-bot.message-send', {text: `It looks like you need some help 🤔 
To check the weather, please type your city name in your message ie. Oslo  `, sender} )
  } else {
    try {
      const forecast = await endpoint.post('openweathermap/get-three-hours', {city: text})
      // Creating response message
      const response = ['In the next few hours you can expect:']
      let rain = false
      forecast.forEach(prediction => {
        response.push(`${prediction.hour} - ${prediction.forecast}`)
        if (prediction.forecast.toLowerCase() == 'rain') {
          rain = true
        }
      })

      // Let's check if it is going to rain and add a proper message to the response
      if (rain) {
        response.push(`It looks like you need an umbrella in ${text} 🌧`)
      } else {
        response.push(`You don\'t need an umbrella in ${text} 😎`)
      }

      // This event will be caught by "messenger-bot" Socket
      // Content of the text argument will be sent as a replay
      event.emit('messenger-bot.message-send', {text: response.join('\n'), sender} )
    } catch(err) {
      // This event will be caught by "messenger-bot" Socket
      // Content of the text argument (in this case error message) will be sent as a replay
      event.emit('messenger-bot.message-send', {text: `Something went wrong: ${err.data.message}.
To check the weather, please type your city name in your message ie. Oslo`, sender} )
    }
  }
}
```

Now you need to deploy your responder Socket:

```sh
$ npx s deploy responder
```

#### Set up messenger-bot to Facebook:
```sh
$ npx s list
```

You will get:
```
socket: messenger-bot
    description: Facebook Messenger Bot
    version: 0.0.3
    type: installed via NPM
    status: ok

        endpoint: messenger-bot/webhook
        description: For authentication purpose
        url: <your-instance-name>/messenger-bot/webhook/
```
Copy endpoint's url and go to your app settings in developers facebook page.
Now in Webhook section click Setup Webhooks and provide the following information:
- Callback URL: your-instance-name/messenger-bot/webhook/
- Verify Token: messenger-bot
- Subscription Fields: messages, messaging_postbacks, message_deliveries
In the same section select your page to subscribe webhook to the page events.

### Testing functionality

Now you can start a chat by clicking on "Message Now" of your Facebook Page (www.messenger.com/t/your-facebook-page-name).
In "Message Now" field type in the name of the city and you should see a 3 hours forecast for it.
