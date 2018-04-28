# Face Auth Socket

- Preparation: **20 minutes**
- Requirements:
  - Initiated Syncano project
- Sockets:
  - [aws-face-auth](https://syncano.io/#/sockets/aws-face-auth)

### Problem to solve

You have a website which uses Syncano [user-auth](https://syncano.io/#/sockets/user-auth) socket for authentication, but you also want to introduce facial authentication as an option for login into your site.

### Solution

Our solution is to use [aws-face-auth](https://syncano.io/#/sockets/aws-face-auth) Syncano socket to add/enable the option facial authentication on your website.

### Setup

#### Installing server dependencies

To install `aws-face-auth` socket type:
```sh
$ npx s add aws-face-auth
```

During installation you will be prompted to provide:

**_AWS_REGION_**: The region on which your instance will operate

**_AWS_SECRET_ACCESS_KEY_**: The secret key to your aws account

**_AWS_ACCESS_KEY_ID_**: The access key to your aws account

**_FACE_MATCH_THRESHOLD_**: The minimum confidence in the face match to return. Minimum value of 0 and Maximum value of 100

**_COLLECTION_ID_**: The ID of the collection to store face indexes

**N/B:** 

To find AWS ACCESS_KEY_ID and AWS SECRET_ACCESS_KEY, log into your AWS account to get it. Also to get Region, search for Comprehend on your AWS Console to check supported regions and select one (e.g, us-east-1 )

Proceed to deploy `aws-face-auth` socket:
```sh
$ npx s deploy aws-face-auth
```

#### JavaScript client setup

Install syncano-client to interact with Syncano socket endpoints: 
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

> Remember to change 'YOUR-INSTANCE' into the instance attached to your project. Run `npx s` in the project folder to have it printed out in your terminal.

##### Create a collection to store face indexes if you haven't done that before and update the socket config for `COLLECTION_ID`

*To create a collection send a request to `aws-face-auth/create-collection` with a `collectionId`. Remember to send request with your admin token since its a private endpoint*
Sample script to register user

```javascript
s.post('aws-face-auth/create-collection', { collectionId: 'face-auth-collection'})
  .then((res) => {
    console.log(res);
  })
```

*Go ahead and set the socket config for `COLLECTION_ID` with the value of the created collection*
```sh
 npx s config-set aws-face-auth COLLECTION_ID face-auth-collection
```

##### For a user to register his/her face to an account send a request to `aws-face-auth/face-register` with parameters

`username=[string]` - user email

`image=[string]` - Path to face image or an S3 object key of face image

`bucketName=[string]` - A base64-encoded bytes or an S3 object key (When sending a base64-encoded bytes take of the string sample 'data:image/png;base64,' from beginning of encoded string.)

`password=[string]` - User password. This is essential since its expected users approve request by confirming password


*Script to setup register face to an account*

```javascript
const args = {
  username: "hello@syncano.com",
  password: "good_password",
  image: "user.png",
  bucketName: "user-bucket"
};
  
s.post('aws-face-auth/face-register', args)
  .then((res) => {
    console.log(res);
  })
```

On success it will return a status code of `200` and response body:
```
{
  message: "User face registered for face authentication."
}
```
This means user can now choose to login using his/her face.

##### When a user chooses to login with facial auth send a request to `aws-face-auth/face-login` with parameters

with parameters

`image=[string]` - A base64-encoded bytes or an S3 object key (When sending a base64-encoded bytes take of the string sample 'data:image/png;base64,' from beginning of encoded string.)

`bucketName=[string]` - Name of s3 bucket. Leave empty if image not on s3 bucket

*Sample script to for the login action*

```javascript
s.post('aws-face-auth/face-login', { username, token, two_factor_token })
  .then((user) => {
    console.log(user);
  })
```

##### When a user d chooses to remove facial authentication on their account send a request to `aws-face-auth/remove-face-auth`

with parameters

`username=[string]` - user email

`token=[string]` - user token

`image=[string]` - A base64-encoded bytes or an S3 object key (When sending a base64-encoded bytes take of the string sample 'data:image/png;base64,' from beginning of encoded string.)

`bucketName=[string]` - Name of s3 bucket. Leave empty if image not on s3 bucket

*Sample script to remove face auth option on a user account*

```javascript
const args = {
  username: "hello@syncano.com",
  token: "12345abcde",
  image: "user.png",
  bucketName: "user-bucket"
};
  
s.post('aws-face-auth/remove-face-auth', args)
  .then((res) => {
    console.log(res);
  })
