# Hosting simple website

* Preparation: **5 minutes**
* Requirements:
  * Initiated Syncano project

### Problem to solve

You want to host simple website on Syncano. 

### Solution

In order to publish your website or application you just have to create a Hosting in Syncano and upload the files there (e.g. index.html file with simple ```<h1>Hello world!</h1>``` tag inside of body section). To set up your page you don't have to do anything more but upload an index.html file and set a CNAME record in your domain name server dashboard. Then the domain will be leading to your page.

#### Create hosting

First you need to create a Hosting. Go to your project's directory with an initiated project and type:

```sh
npx s hosting add <path-of-local-project-folder-to-host>
```

<!-- If you answer yes when prompted about syncing the files, they will be hosted for you instantly and available under the url matching the following schema:
```
https://<hosting_name>--<instance_name>.syncano.site
``` -->

If you want your own domain to point to your hosted files you need to create CNAME record in DNS which looks like:
``` 
CNAME your.domain.com -> <instance_name>.syncano.site
``` 
and set it when asked in prompt below or confirm that CNAME should be empty (to use internal address)

Now, you will be asked to provide some info:
```
* Please name this hosting
* Please choose directory of your project (this one appears if you don't specify the path-of-local-project-folder-to-host)
* Do you want to set CNAME now (your own domain) or should it be empty?
```

After proceeding with these prompts, hosting will be added to your configuration in `syncano.yml` hosting section. You have to `deploy` configuration after that operation. In terminal type:
```
npx s deploy
```
#### Sync your files with hosting
To synchronize all the hosting files(e.g. after any change in your project folder) execute:
```sh
npx s hosting sync <hosting_name>
```
After running this command all the hosting files will be uploaded/updated. You can find all of them in URL printed after successful synchronization.

#### List hosting info 
To list Hosting configuration:
```sh
npx s hosting list <hosting-name>
```

Example response:
```
    Your Hosting containers:

    name: hello
    url: https://<hosting_name>--<instance_name>.syncano.site
```
If you copy this link and paste it in your browser you should see your site (e.g. index.html rendered with "Hello World!" header).



