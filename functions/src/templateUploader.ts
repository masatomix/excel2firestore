import { Request, Response } from 'express'
import * as admin from 'firebase-admin'

import * as Busboy from 'busboy'

export const templateUpload = async (request: Request, response: Response) => {
  // https://qiita.com/rubytomato@github/items/11c7f3fcaf60f5ce3365
  console.log('start.')
  const busboy = new Busboy({ headers: request.headers })
  const bucket = admin.storage().bucket()

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    console.log('busboy.on.file start.')
    console.log(`File [${fieldname}]: filename: ${filename}, encoding: ${encoding} , mimetype: ${mimetype}`)

    file.on('data', async (data) => {
      console.log(`File [${fieldname}] got ${data.length} bytes`)
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
      console.log(`File [${fieldname}] Finished`)
    })
  })

  busboy.on('finish', () => {
    console.log('busboy.on.finish start.')
    response.status(200).end('Finished.')
  })

  const reqex: any = request
  // The raw bytes of the upload will be in req.rawBody. Send it to
  // busboy, and get a callback when it's finished.
  busboy.end(reqex.rawBody)
}
