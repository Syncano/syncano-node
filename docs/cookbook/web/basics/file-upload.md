# File upload using data objects

* Preparation: **5 minutes**
* Requirements:
  * Initiated Syncano project

### Problem to solve

You want to upload file to the database.

### Solution

You'll have to create form with upload field and socket to handle it.


#### Create socket

At first you need to create a socket. Go to your project's directory with initiated syncano project and type:

```sh
npx s create application
```

Syncano has `file` type created for storage. You have to create a data class with this type in your `syncano/application/socket.yml` file.

```
name: application
description: Description of application
version: 0.0.1
runtime: nodejs_v8

classes:
  files:
    - name: file
      type: file

endpoints:
  upload: 
    description: add new file
    parameters: 
      file: 
        type: file
        description: application info
    response:
      success: 
        description: Success
        example:
          {
            "msg": "uploaded ok"
          }
      fail:
        exit_code: 400
        description: Failed
        parameters:
          message:
            description: Error message

```

Next you need to install `form-data` package using `npm install -D form-data` inside of your socket directory. After that, in your endpoint (`upload.js`) you can to handle the file using it.

```js
import Syncano from '@syncano/core'
import FormData from 'form-data'

export default (ctx) => {
  const {data, response} = new Syncano(ctx)

  if (ctx.args.file) {
    const form = new FormData() 
    form.append('file', ctx.args.file, {
      filename: ctx.args.filename,
      filetype: ctx.args.filetype
    })
    
    data.files.create(form).then( (res) => { 
      response.json({
        message: `File uploaded`
      })
    })
  } else {
    response.json({
      message: 'Something went wrong'
    }, 400)
  }
}

```

#### Create client-side code

Let's assume that you have a simple form in HTML:

```html
  <form enctype="multipart/form-data">
    <div>
      <input type="file" id="upload"/>
    </div> 
    <div>
      <button class="submit--js">upload</button>
    </div> 
  </form>

```

You have to handle form submit with javascript:

```js
  import Syncano from '@syncano/client'

  let s = new Syncano("your-instance");

  const submit = document.querySelector(".submit--js");

  submit.addEventListener("click", e => {
    e.preventDefault();
    const file = document.querySelector("#upload").files[0];
    let formData = new FormData(); 
    formData.append("file", file);
    formData.append("filetype", file.filetype);
    formData.append("filename", file.name);
    console.log(formData)
    s.post("application/upload", formData).then(res => {
      console.log(res);
    });
  });

```

After submitting the file, data object will store link to your file hosted on the S3. File size limit is 6MB.