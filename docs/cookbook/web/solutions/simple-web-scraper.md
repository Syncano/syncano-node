# Simple Web Scraper

* Preparation: **2 minutes**
* Requirements:
  * Initiated Syncano project

### Problem to solve

You want to execute simple scraping on a webpage using either css-selector or xpath and get response in either XML or JSON format:

### Solution

Our solution is established using [simple-web-scraper](https://syncano.io/#/sockets/simple-web-scraper) with options of getting response in XML or JSON format.

### Installing dependencies

#### Server-side

To install simple-web-scraper, type:

```sh
$ npx s add simple-web-scraper
```

Deploy simple-web-scraper to update socket

```sh
$ npx s deploy simple-web-scraper
```

#### Client-side

Install syncano-client to interact with Syncano simple-web-scraper socket: 
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

Implement simple web scraping using scraping endpoint:
N/B example is based on Reactjs framework

```javascript
  const scrapeWeb = (args) => {
  return (dispatch) => {
    return axios({
      data: args,
      method: 'GET',
      url: appendArgs(`${process.env.GETURL}/simple-web-scraper/scraping/`, args),
    })
      .then((response) => {
        if (response) {
          dispatch({
            type: GET_SCRAPED_DATA_SUCCESSFUL,
            payload: response.data
          });
        }
      })
      .catch((error) => {
        dispatch({
          type: GET_SCRAPED_DATA_FAILED,
          error,
        });
      });
  };
};
```

### Testing functionality
Demo repo: [Simple web scraper demo](https://github.com/Syncano/syncano-react-web-scraping-demo/tree/develop)
Now you can create a form like the one below to execute simple-web-scraping; ensure to provide URL, Identifier, selector, selector-type and extract option:
<img width="710" alt="screen shot 2018-03-08 at 9 04 50 am" src="https://user-images.githubusercontent.com/24938072/37140622-a7793b6c-22b2-11e8-941b-200c73d6e767.png">
