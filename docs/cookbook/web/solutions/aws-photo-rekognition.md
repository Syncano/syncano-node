# AWS Photo Rekognition

* Preparation: **2 minutes**
* Requirements:
  * Initiated Syncano project
  * AWS ACCESS_KEY_ID
  * AWS SECRET_ACCESS_KEY
  * Region

### Problem to solve

You want to integrate a service that detects faces in an image into your application:

### Solution

Our solution is established using [aws-rekognition](https://syncano.io/#/sockets/aws-photo-rekognition), a service that makes it easy to add image analysis to your applications.

### Installing dependencies

#### Server-side

To install aws-photo-rekognition, type:

```sh
$ npx s add aws-photo-rekognition
```

Provide `AWS ACCESS_KEY_ID`, `AWS SECRET_ACCESS_KEY` and `Region`

* N/B: To find `AWS ACCESS_KEY_ID` and `AWS SECRET_ACCESS_KEY`, log into your AWS account to get it.
Also to get `Region`, search for Rekognition on your AWS Console to check supported regions and select one (e.g, us-east-1 )

Deploy aws-photo-rekognition to update socket

```sh
$ npx s deploy aws-photo-rekognition
```

#### Client-side

Install syncano-client to interact with Syncano aws-photo-rekognition socket: 
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

Detect faces on image using aws-photo-rekognition `detectFaces` endpoint:

```javascript

const photoRekognition = rekognitionParams => {
  try {
    const rekognitionParams = {
        imageName: 'emmanuel.jpg',
        bucketName: 'syncano',
      }
    s.get("aws-photo-rekognition/detectFaces", rekognitionParams);
    ( {data} ) => {
      return data;
    }
  } catch ( {message} ) {
    return message;
  }
};
```

### Testing functionality

In your application, you could decide if the users can upload an image or use an S3 bucket image to detect faces on it; and return corresponding data.