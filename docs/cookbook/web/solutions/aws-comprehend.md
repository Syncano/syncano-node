# AWS Comprehend Socket

- Preparation: **10 minutes**
- Requirements:
  - Initiated Syncano project
  - AWS config parameters (AWS region, AWS secret access key and AWS access key id)
- Sockets:
  - [aws-comprehend](https://syncano.io/#/sockets/aws-comprehend)

### Problem to solve

You placed a form online to get reviews from a product you newly released on your online platform so you can determine the:
  - Inference of the prevailing sentiment (POSITIVE, NEUTRAL, MIXED, NEGATIVE) about the product
  - Dominant languages used by customers using the product
  - How customers describe your product

### Solution

Our solution is to use [aws-comprehend](https://syncano.io/#/sockets/aws-comprehend) Syncano socket to get all the insights and answers from the product reviews gotten from the customers.

### Setup

#### Installing server dependencies

To install `aws-comprehend` type:
```sh
$ syncano-cli add aws-comprehend
```

During installation you will be prompted to provide:

**_AWS_REGION_**: The region on which your instance will operate

**_AWS_SECRET_ACCESS_KEY_**: The secret key to your aws account

**_AWS_ACCESS_KEY_ID_**: The access key to your aws account

**N/B:** 

To find AWS ACCESS_KEY_ID and AWS SECRET_ACCESS_KEY, log into your AWS account to get it. Also to get Region, search for Comprehend on your AWS Console to check supported regions and select one (e.g, us-east-1 )

Proceed to deploy `aws-comprehend` socket:
```sh
$ npx s deploy aws-comprehend
```

#### JavaScript client setup

Create an index.html file and setup a connection by initializing SyncanoClient object with instance name:

```HTML
<script src="https://unpkg.com/@syncano/client"></script>
<script>
    const s = new SyncanoClient('YOUR-INSTANCE');
</script>
```

> Remember to change 'YOUR-INSTANCE' into the instance attached to your project. Run `npx s` in the project folder to have it printed out in your terminal.


*To get the Dominant language used by customers using the product pass an array of user reviews to `batch-detect-dominant-language` endpoint*

Example array of customer reviews:
```
TextList:[
      "Syncano helps the startups in our Fintech and Insurtech accelerator programs to reach product market fit faster",
      "Bonne réflexion bon produit"
    ]
```
Sample script to get dominant languages used
```javascript
s.post('aws-comprehend/batch-detect-dominant-language', { TextList })
  .then((res) => {
    console.log(res, 'dominant language');
  })
```

*You can now group the reviews based on languages*

Sample parameter to send in order to get insights on the prevailing sentiment and key phrases used by customers in reviewing the product

```javascript
const param = {
  TextList:[
        "Syncano helps the startups in our Fintech and Insurtech accelerator programs to reach product market fit faster",
        "Good thinking good product"
      ],
  LanguageCode: "en"
}
```

*Sample script to get prevailing sentiment*

```javascript
s.post('aws-comprehend/batch-detect-sentiment', param)
  .then((res) => {
    console.log(res, 'prevailing sentiment');
  })
```

*To get key phrases used by customers to describe the product replace `batch-detect-sentiment` with `batch-detect-key-phrases` from script above*

Now, when you open the index.html file and look in the browser console, you will see logs to all the answers of the problem the online review aim to solve. 
