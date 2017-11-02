# Socket Config Options

Every Syncano Socket can use configuration options, which will be exposed inside the scripts. Configuration options are used to pass important settings to the scripts (e.g. API keys, URLs, user names etc.).

## Initial configuration

During the installation/synchronization of the Socket, you will be asked to fill in values for required config options. E.g. `openweathermap` Socket requires API key (`API_KEY`) config option:

```sh
syncano-cli add openweathermap
```

```
    Socket openweathermap (0.0.29) has been added to the config file.

?   OpenWeatherMap API key (API_KEY)
    To find the API key, go to your OpenWeatherMap account and copy it from
    API keys section at (https://home.openweathermap.org/api_keys).

    Type in value: bf0a7ccf140879bc0c98a85f3b8b2c94
    Your socket is ready for use! Type syncano-cli list openweathermap to see docs.
```

## List config options
```sh
syncano-cli config-show <socket name>
```

Example:
```sh
syncano-cli config-show openweathermap
```

```
         name: API_KEY (required)
  description: OpenWeatherMap API key
        value: bf0a7ccf140879bc0c98a85f3b8b2c94
```

## Change config

To change the value of the config option type in:
```sh
syncano-cli config-set <socket name> <config option name> <new value>
```

For example:
```sh
syncano-cli config-set openweathermap API_KEY bf0a7ccf140879bc9c98a85f3b8b2c94
```
