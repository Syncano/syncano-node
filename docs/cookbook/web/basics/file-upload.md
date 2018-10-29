# File upload using Data Objects

* Preparation: **5 minutes**
* Requirements:
  * Initiated Syncano project

### Problem to solve

You want to upload a file to Syncano.

### Solution

You'll have to create a form with an upload field and a Socket to handle it.

#### Create a Socket and update the socket.yml

First you need to create a Socket. Go to your project's directory with an initiated project and type:

```sh
npx s create documents-socket
```

Syncano Data Classes have a `file` type schema property that is suitable for file storage. You have to create a class with this type in your `syncano/documents-socket/socket.yml` file. You'll also need to define an `upload` endpoint that will handle writing files to the `files` class.

```
name: documents-socket
description: An example of file uploads on Syncano
version: 0.0.1
runtime: nodejs_v8

classes:
  files:
    - name: file
      type: file

endpoints:
  upload:
    description: Endpoint to upload new files
    parameters:
      file:
        type: file
        description: Document that will be uploaded to the 'files' class
    response:
      examples:
        -
          exit_code: 200
          description: Success
          example: |
            {
              "message": "Upload successful"
            }
        -
          exit_code: 400
          description: Failure
          example: |
            {
              "message": "Upload failed"
            }

```

#### Add Syncano server-side code

Next, you need to install `form-data` package using `npm install -D form-data` inside your socket directory. After that you can handle the file upload in your `src/upload.js` script.

```js
import Syncano from '@syncano/core'
import FormData from 'form-data'

export default (ctx) => {
  const {data, response} = new Syncano(ctx)
  const {file, filename, filetype} = ctx.args
  const form = new FormData()

  if (file) {
    form.append('file', file, {filename, filetype})
    data.files.create(form)
      .then((res) => {
        return response.json({message: `Upload successful`})
      })
      .catch(({ error, statusCode = 400 }) => {
        return response.json(error, statusCode)
      })
  } else {
    return response.json({message: 'Upload failed'}, 400)
  }
}

```

#### Create client-side code

Let's assume that you have a simple HTML form:

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

You'll have to handle the form submission with javascript:

```html
<script src="https://unpkg.com/@syncano/client"></script>
<script>
window.addEventListener('load', function () {
  const s = new SyncanoClient('<YOUR-INSTANCE-NAME>')
  const submit = document.querySelector('.submit--js')

  submit.addEventListener('click', e => {
    e.preventDefault()
    const file = document.querySelector('#upload').files[0]
    const formData = new FormData()

    formData.append('file', file)
    formData.append('filetype', file.filetype)
    formData.append('filename', file.name)
    s.post('<YOUR-SOCKET-NAME>/upload', formData)
      .then(res => { console.log(res) })
      .catch(err => { console.error(err) })
  })
})
</script>
```

After submitting a file, the Data Object will store a url to this file.

> File size limit is 6MB.
