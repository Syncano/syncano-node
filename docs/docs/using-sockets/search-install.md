# Search & Install

The easiest way to start working with Syncano is to install ready made Syncano Sockets from the Syncano Registry.

## Search
Syncano Sockets can be searched by name, description and tags, so you will find Sockets matching your search criteria. When you find Socket that interests you, use its name to install it.

```sh
npx syncano-cli search <keyword>
```

Example:
```sh
npx syncano-cli search weather
```
```sh
    1 socket(s) found:

    name                 description             author       version   keywords
    openweathermap       Interface for OpenW…    m@kucharz... 0.0.28    weather
```

## Install
```sh
npx syncano-cli add openweathermap
```

```
    Socket openweathermap (0.0.28) has been added to the config file.

?   OpenWeatherMap API key (API_KEY)
    To find the API key, go to your OpenWeatherMap account and copy it from
    API keys section at (https://home.openweathermap.org/api_keys).

    Type in value: bf0a7ccf140879bc0c98a85f3b8b2c94
    Your socket is ready for use! Type syncano-cli list openweathermap to see docs.
```
### Manual installation

You can also add Socket name and version into `dependencies` section in the main config file `syncano.yml`:

```yaml
dependencies:
    openweathermap:
      version: 0.0.28
```

After doing that it is necessary to run `sync` command for it to be installed on the server side:
```sh
npx syncano-cli deploy
```
