# Listing Sockets

Syncano Sockets contain definition of the API they are exposing. Therefore when you have Sockets installed you can always check the Socket documentation and list all Sockets installed in your Syncano Instance.

## List

To list all installed Syncano Sockets on your Syncano Instance, type:
```sh
syncano-cli list
```

You will get all the Sockets and basic information about them:
  - basic info (name, description, status)
  - list of endpoints
  - list of event handlers
  - list of events

```yaml
socket: openweathermap
description: Interface for OpenWeatherMap API
status: synced

    endpoint: openweathermap/get-temperature
    description: Get actual temperature
    url: https://wild-paper-5055.syncano.link/openweathermap/get-temperature/

    endpoint: openweathermap/get-three-hours-forecast
    description: Get three hours weather forecast
    url: https://wild-paper-5055.syncano.link/openweathermap/get-three-hours-forecast/

socket: slack
description: Integration with Slack
status: synced

    endpoint: slack/webhook
    description: Receive updates from Slack
    url: https://wild-paper-5055.syncano.link/slack/webhook/

    endpoint: slack/send-msg
    description: Send message to Slack channel
    url: https://wild-paper-5055.syncano.link/slack/send-msg/

    event handler: events.slack-send-msg
    description: Handling sending message to Slack channel
```

## Details
```sh
syncano-cli list <socket name>
```
You will get detailed information about chosen socket:
  - basic info (name, description, status)
  - list of endpoints with parameters
  - list of event handlers with parameters
  - list of events with parameters

!> Some of the Sockets may not have parameters or the parameters are not documented.

Example:
```sh
syncano-cli list openweathermap
```
```yaml
socket: openweathermap
description: Interface for OpenWeatherMap API
status: synced

    endpoint: openweathermap/get-temperature
    description: Get actual temperature
    url: https://wild-paper-5055.syncano.link/openweathermap/get-temperature/

        params:

        name: city
        description: City for which you want to get weather
        example: Oslo

        response: application/json

        description: Success
        exit code: 200
        example:
        {
          "temp":"-2.3"
        }


        description: Failed
        exit code: 400
        example:
        {
          "message":"Error: Not found city"
        }


    endpoint: openweathermap/get-three-hours-forecast
    description: Get three hours weather forecast
    url: https://wild-paper-5055.syncano.link/openweathermap/get-three-hours-forecast/

        params:

        name: city
        description: City for which you want to get weather
        example: Oslo

        response: application/json

        description: Success
        exit code: 200
        example:
        [
          { "weather": "rain", "hour": "12pm" },
          { "weather": "clear sky", "hour": "1pm" }
        ]


        description: Failed
        exit code: 400
        example:
        {
          "message": "City not found"
        }
```
