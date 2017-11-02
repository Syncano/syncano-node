# Facebook Weather Bot

- Preparation: **6 minutes**
- Requirements:
  - Initiated Syncano project
  - OpenWeatherMap API key
  - Facebook App Page Token
- Sockets:
  - [openweathermap](https://syncano.io/#/sockets/openweathermap)
  - [messenger-bot](https://syncano.io/#/sockets/messenger-bot)

### Problem to solve

You want to build simple Messenger bot for Facebook page which can give you forecast for next 3 hours for particular city.

### Solution

Our solution is based on two Sockets. [openweathermap](https://syncano.io/#/sockets/openweathermap) Socket will be used to get weather data from [OpenWeatherMap](https://openweathermap.org/) service using their API. [messenger-bot](https://syncano.io/#/sockets/messenger-bot) will be used for communication with Facebook. On top of that, we will create `responder` Socket which will connect those two functionalities.


#### Installing dependencies

To install `openweathermap` type:
```sh
$ syncano-cli socket install openweathermap
```

Now you have to provide API key for the OpenWeatherMap Service:
```
    Socket openweathermap (0.0.11) has been added to the config file.

?   OpenWeatherMap API key (APP_ID)
    To find the API key, go to your OpenWeatherMap account and copy it from
    API keys section at (https://home.openweathermap.org/api_keys).

    Type in value: bf0a7ccf140879bc0098a85f3b8b2c94
    Your socket is ready to use! Type syncano-cli socket list openweathermap to see docs.
```

To install `messenger-bot` type:
```sh
$ syncano-cli socket install messenger-bot
```

To properly configure the Socket you will need create Facebook Page and Facebook Application.
Then you have to provide `Page Token`, follow the instructions to get it from Facebook developer portal:
```
    Socket messenger-bot (0.0.21) has been added to the config file.

?   Facebook App Page Token (FACEBOOK_APP_TOKEN)
    To find the token, go to the 'Messenger > Settings > Token Generation' section in your Facebook Application settings panel at https://developers.facebook.com.

    Type in value: EAAbvRMZClZC4YBAL63OHJLSMWwbSKg9BM1eojt2VU0fv95vkgURMjqDqKPUVZCuN3HjNE8fjt2TJfK8Jt68fwVAAltb8JnQjgpcbMHF9eqh2OiH4ZC0ftsJz3h5ZA7wKOWacDOQGte9b9Lhl3KKuvdrJJhIgjZAAeXKgUXmSkEdgZDZD
    Your socket is ready to use! Type syncano-cli socket list messenger-bot to see docs.
```

#### Creating a "responder" Socket

Now we are ready to send/receive messages from Facebook Messenger and collecting weather data from OpenWeatherMap.

We need to only create a logic which will be responsible for the data flow:
  - receive a message from Messenger
  - ask OpenWeatherMap for the forecast for given city name
  - respond with the nice looking text about the weather forecast

We will create new Socket called `responder`:

```sh
$ syncano-cli socket create responder
```

Choose empty project for this Socket:
```
?   Choose template for your Socket     empty - Empty Socket

    Your Socket configuration is stored at syncano/responder
```

#### Building logic of the "responder" Socket

First thing is to catch en event about received message, to do that we have to add event handler o to the Socket config file (syncnao/responder/socket.yml):

```yaml
event_handlers:
  events.m-bot-msg-rec:
    description: Handling "m-bot-msg-rec" events sent by messenger-bot when message was received
    file: scripts/response.js
```

You socket config file (`socket.yml`) should now looks like this:

```yaml
name: responder
description: Description of responder
version: 0.0.1

event_handlers:
  events.m-bot-msg-rec:
    description: Handling requests from FB
    file: scripts/response.js
```

Next step is to create actual script to:

```javascript
import { endpoint, event } from 'syncano-server'


const city = ARGS.text  // Getting a city name from the input argument
const sender = ARGS.sender // ID of the user who sent the message

// Getting forecast by calling "openweathermap" socket and "get-three-hours-forecast" endpoint
endpoint.post('openweathermap/get-three-hours-forecast', {city})
  .then(resp => resp.json())
  .then(forecast => {

    // Creating response message
    const response = ['In next 3 hours you can expect:']
    let rain = false
    forecast.forEach(prediction => {
       response.push(`${prediction.hour} - ${prediction.forecast}`)
       if (prediction.forecast.toLowerCase() == 'rain') {
         rain = true
       }
    })

    // Let's check if it is going to rain and add proper message to response
    if (rain) {
      response.push(`It looks like you need an umbrella in ${city}!`)
    } else {
      response.push(`You don\'t need an umbrella in ${city}!`)
    }

    // This event will be caught by "messenger-bot" Socket
    // Content of the text argument will be sent as a replay
    event.emit('m-bot-msg-send', {text: response.join('\n'), sender})
  })
  .catch(err => {
    // This event will be caught by "messenger-bot" Socket
    // Content of the text argument (in this case error message) will be sent as a replay
    event.emit('m-bot-msg-send', {text: err.message, sender})
  })
```

### Testing functionality

Now you can start a chat by clicking on "Message Now" link of your Facebook Page.
Type in the name of the city and you should see a 3 hours forecast for it.
