# Event Handlers

Event handlers are a way to define asynchronous scripts that handle either user-defined or built-in events, including scheduling of some actions to run periodically.

Possible Event Handler types are:

|Event Handler                         |Description                                           |
|--------------------------------------|------------------------------------------------------|
|`data.<class>.<create/update/delete>` |built-in events for classes                           |
|`schedule.interval.5_minutes`         |built-in events for interval script runs              |
|`schedule.crontab.*/5 * * * *`        |built-in events for scheduled script runs with *cron* |
|`events.<name of custom event>`       |user-defined event                                    |

For example, if I wanted a script to be run after a Data Object is created in `cars` class, I would add following configuration into the `socket.yml`:

```yaml
event_handlers:
  data.cars.create:
    file: ./event_handlers/data.cars.create.js
```
