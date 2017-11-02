# Config Options

Every Syncano Socket can use configuration options, which will be exposed inside the scripts. Configuration options are used to pass important settings to the scripts (e.g. API keys, URLs, user names etc.).

## Defining config options

Basic structure of a `config` section in a socket config file looks like this:

```yaml
config:
  <config option name>:
    description: <config option short description>
    long_description: <config option long description>
    required: <true|false>
```

How it works?
  - `config option name` - is a name of the variable which will be accessible from a script
  - `description` - *optional* - short description of the config option
  - `long_description` - *optional* - long description of the config option
  - `required` - *optional* - `true` if the option is required (`false` by default)

Here is an example for OpenWeatherMap Socket:

```yaml
config:
  API_KEY:
    description: OpenWeatherMap API key
    long_description: |
      To find the API key, go to your OpenWeatherMap account and copy it from
      API keys section at (https://home.openweathermap.org/api_keys).
    required: true
```

It can be later accessed from every Socket Script within the current Instance with this code:

```javascript
const apiKey = CONFIG.API_KEY;
console.log(apiKey);
```
> Read more here about [Script environment]() to know what else you can access from inside a script
