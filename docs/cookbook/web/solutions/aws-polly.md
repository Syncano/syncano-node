# AWS Polly

* Preparation: **2 minutes**
* Requirements:
  * Initiated Syncano project
  * AWS ACCESS_KEY_ID
  * AWS SECRET_ACCESS_KEY
  * Region

### Problem to solve

You want to integrate a service that converts text to speech into your application:

### Solution

Our solution is established using [aws-polly](https://syncano.io/#/sockets/aws-polly) Text-to-Speech (TTS) cloud service that converts text into lifelike speech.

### Installing dependencies

#### Server-side

To install aws-polly, type:

```sh
$ npx s add aws-polly
```

Provide `AWS ACCESS_KEY_ID`, `AWS SECRET_ACCESS_KEY` and `Region`

* N/B: To find `AWS ACCESS_KEY_ID` and `AWS SECRET_ACCESS_KEY`, log into your AWS account to get it.
Also to get `Region`, search for Polly on your AWS Console to check supported regions and select one (e.g, us-east-1 )

Deploy aws-polly to update socket

```sh
$ npx s deploy aws-polly
```

#### Client-side

Install syncano-client to interact with Syncano aws-polly socket: 
N/B: There are two way's of achieving installation.

1. When using webpack and es6 the way to handle the client lib is:
Shell:

```sh
$ npm i -S @syncano/client
```

Create a connection by initializing Syncano object with instance name:

```javascript
import SyncanoClient from "@syncano/client"

const s = new SyncanoClient("MY_INSTANCE_NAME");
```

2. And the vanilla js way:
```HTML
<script src="https://unpkg.com/@syncano/client"></script>
<script>
  const s = new SyncanoClient("MY_INSTANCE_NAME");
</script>
```

Implement text-to-speech process using aws-polly synthesizeSpeech endpoint:

```javascript

const polly = synthesizeSpeechParams => {
  try {
    const synthesizeSpeech = s.post("aws-polly/synthesizeSpeech", synthesizeSpeechParams);
    (response) => {
      return { data: response.data}
    }
  } catch (error) {
    return error.message;
  }
};
```

### Testing functionality

Now you can create a text-box collecting text from user and pass it on to the aws-polly/synthesizeSpeech endpoint. In your application, you could decide if the users can download the file or playback the synthesized speech directly.