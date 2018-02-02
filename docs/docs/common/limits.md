# Limits

The limits we apply are based on our research on data operations and are set to provide best performance and user experience. If they block you for any reason, please contact us so that we can work on a custom solution.

## Data Objects

- Maximal size of a Data Object is `32kB`.
- Data Objects can have a max of `32` fields.
- `16` of the fields can be indexed, `8` if both `order_index` and `filter_index` is used for each field
- `text`, `file` and `object` fields can't be indexed.
- Data Object field names can have a maximum length of `64` characters.

Limits for the specific Data Object fields:

| Field type | Limit | Notes |
|--- |--- |--- |
|text|32000 max character length||
|string|128 max character length||
|integer|32-bit (signed)||
|float|64-bit|Double precision field with up to 15 decimal digit precision|
|array|Can hold only Strings, Integer or Floats|Cannot contain Object type (JSON fields)|
|relation|Can hold relations to max 1000 Data Objects from one selected Data Class|Relation can be linked to only one selected data class. You cannot have Relation field storing references to Data Objects from multiple different data classes.|
|object|Any JSON object|Without limits, limited only by the max size of Data Object (32kB)|
|file|binary data, max 128MB|||

## Requests

Limits for the number of requests that can be made within one account.

| Request number / second | Request target/source |
|--- |--- |
|60|Administrator with Production Plan account (paid)|
|60|Administrator with Builder Plan account (free)|
|60|Instance (either by admin or API Key usage on a Production plan)|
|10|Anonymous usage|

## Socket Scripts

```
Applies for both Socket Endpoint Scripts and Event Handlers
```
The default execution time for Scripts is `30` seconds. It can be adjusted by adding a `timeout` property in the socket.yml. A valid range is `0 >` and `< 300` seconds. Integer and float values are allowed.

socket.yml example for endpoint with a custom timeout:
```
endpoints:
  i-will-timeout:
    timeout: 41.9
```

**Script Traces Retention time**

```
Traces are the Script execution logs. It's what you see in the command line when running `s hot` and calling any endpoint
```

Syncano will store the last 100 of Snippet Scripts Traces, for max period of 24 hours. Older traces will be automatically removed. Traces created more than 24 hours ago will be removed (even if they would inside the "last 100" limit).

## Instances

Maximum number of Instances that an administrator can be an owner of is `16`. There's no limit on the number of Instances that an administrator can be invited to.

## Classes

Maximum number of Classes that can be created on paid accounts within a single Instance is `100`

## Groups

There is no limit on a maximum number of groups within an Instance. Maximum number of Groups User can belong to is `32`.

