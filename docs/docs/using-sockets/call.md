# Calling Sockets

Installed Sockets can be reached by calling them using the `syncano-client` library, directly by calling a URL, or via the Syncano CLI.

## Calling Syncano Sockets from the Syncano CLI

For testing purposes you can call the Syncano Socket's endpoint directly from the Syncano CLI:

```sh
npx syncano-cli call <socket name>/<endpoint name>
```
Example:
```sh
npx syncano-cli call openweathermap/get-three-hours-forecast
```
You will be asked to provide the parameters (based on the specification of the endpoint):
```
    You can pass 1 parameter(s) to openweathermap/get-three-hours-forecast endpoint:

    - city (string) City for which you want to get weather for

?   Type in value for "city" parameter Oslo

    statusCode: 200
    content-type: application/json
    body:

    [ { forecast: 'Rain', hour: '6 PM' },
      { forecast: 'Rain', hour: '9 PM' },
      { forecast: 'Clouds', hour: '12 AM' } ]
```
## Calling Syncano Sockets from the syncano-client

You can call an endpoint from any JS environment:
```js
import Syncano from 'syncano-client';

const s = new Syncano('<your instance name>')

// calling "openweathermap" socket and "get-three-hours-forecast" endpoint
s('openweathermap/get-three-hours-forecast', {city: "Oslo"})
```

## Calling Syncano Sockets from the @syncano/core

From inside the Socket script, (the code of the Syncano Socket, which is what powers it), you can call any other `endpoint` of the Socket installed in your Instance:
```js
import { socket } from '@syncano/core'

// calling "openweathermap" socket and "get-three-hours-forecast" endpoint
socket.get('openweathermap/get-three-hours-forecast', {city: "Oslo"})
```

## Using HTTP clients

You can also call an endpoint by using any HTTP client, use endpoint URL (you can find it in Socket details), e.g.:
```
https://wild-paper-5055.syncano.link/openweathermap/get-three-hours-forecast/
```

To use it properly you have to add required argument - in this case `city`:
```
https://wild-paper-5055.syncano.link/openweathermap/get-three-hours-forecast/?city=Oslo
```

### Using Curl
You can use `curl` to make a call to Syncano endpoints:
```sh
curl https://wild-paper-5055.syncano.link/openweathermap/get-three-hours-forecast/?city=Oslo
```
```
[{"forecast":"Rain","hour":"6 PM"},{"forecast":"Rain","hour":"9 PM"},{"forecast":"Clouds","hour":"12 AM"}]
```
