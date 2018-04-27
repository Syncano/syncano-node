# Stripe Payment Integration

* Preparation: **2 minutes**
* Requirements:
  * Initiated Syncano project
  * Stripe secret_key
  * Stripe publishable_key

### Problem to solve

You want to integrate payment platform to your web application that allows users make payments using credit cards such as:

* Visa
* Visa (debit)
* Mastercard
* Mastercard (2-series)
* Mastercard (debit)
* Mastercard (prepaid)
* American Express
* American Express
* Discover
* Discover
* Diners Club
* JCB

### Solution

Our solution is established using [stripe-payments](https://syncano.io/#/sockets/stripe-payments) to trigger payment service.

### Installing dependencies

#### Server-side

To install stripe-payments, type:

```sh
$ npx s add stripe-payments
```

Provide `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`

* N/B: To find the keys, log into your Stripe account, navigate to [API](https://dashboard.stripe.com/account/apikeys).

Deploy stripe-payment to update socket

```sh
$ npx s deploy stripe-payments
```

#### Client-side

Install syncano-client to interact with Syncano stripe-payments socket: 
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

Implement charge process using stripe test cards:

```javascript
const make_payment = async card_details => {
  try {
    const getToken = await s.post("stripe-payments/tokens/token", card_details);
    const token = getToken.data.id;
    const chargeParams = {
      chargeParameter: {
        amount: 2000,
        currency: "usd",
        source: token,
        description: "Payment demonstration"
      }
    };
    return await s.post("stripe-payments/charge/charges", chargeParams);
  } catch (error) {
    return error.message;
  }
};
```

### Testing functionality
Demo repo: [Stripe payments demo](https://github.com/Syncano/syncano-react-demo-stripe-payments/tree/develop)
Now you can create a payment form collecting `card details` from user and pass to script file.