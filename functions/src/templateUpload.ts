import * as express from 'express'
import * as admin from 'firebase-admin'

// import * as path from 'path'
// import * as os from 'os'
import * as Busboy from 'busboy'
// import * as fs from 'fs'

export const templateUpload = async (
  request: express.Request,
  response: express.Response,
) => {
  // https://qiita.com/rubytomato@github/items/11c7f3fcaf60f5ce3365
  console.log('start.')
  const busboy = new Busboy({ headers: request.headers })
  // This object will accumulate all the uploaded files, keyed by their name.
  const uploads: any = {}
  // const tmpdir = os.tmpdir()

  const bucket = admin.storage().bucket()
  // This callback will be invoked for each file uploaded.
  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    console.log('busboy.on.file start.')
    uploads[fieldname] = filename

    file.on('data', async data => {
      console.log('File [' + fieldname + '] got ' + data.length + ' bytes')
      try {
        await bucket.file(filename).save(data, {
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
      } catch (error) {
        console.log(error)
        response.status(500).send(error)
      }
    })

    file.on('end', () => {
      console.log('file.on.end start.')
      console.log('upload file: ' + filename + ' metadata: ' + mimetype)
      response.status(200).send('OK!')
    })
  })

  // This callback will be invoked after all uploaded files are saved.
  busboy.on('finish', () => {
    console.log('busboy.on.finish start.')
    if (Object.keys(uploads).length === 0) {
      console.log('success: 0 file upload')
      // res.status(200).send('success: 0 file upload')
      return
    }
    console.log('finish : ' + JSON.stringify(uploads))
    // res.status(200).send(operationIds)
  })

  const reqex: any = request
  // The raw bytes of the upload will be in req.rawBody. Send it to
  // busboy, and get a callback when it's finished.
  busboy.end(reqex.rawBody)
}
