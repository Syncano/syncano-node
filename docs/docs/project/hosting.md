# Hosting

## Overview

Hosting lets you store the files in Syncano and make them accessible via custom domains. In order to publish your website or application you just have to create a Hosting in Syncano and upload the files there. Your domains will link to a default page explaining how to use CLI as a main tool to manage your application's backend. To set up your page you don't have to do anything more but upload an index file. Then the domain will be leading to your page.

## Hosting Configuration

Managing your hosting is straightforward:

To add a folder with your static website files, run:

```
syncano-cli hosting add
```

If you answer `yes` when prompted about syncing the files, they will be hosted for you instantly and available under the url matching the following schema:

`https://<hosting_name>--<instance_name>.syncano.site`

Please see the [CLI Hosting Reference](/cli-reference/commands?id=hosting) for documentation about the additional commands.
