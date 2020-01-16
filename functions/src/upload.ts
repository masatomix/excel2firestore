import * as express from 'express'
import * as admin from 'firebase-admin'

import { excel2Sample4 } from './sample4'

import * as path from 'path'
import * as os from 'os'
import * as Busboy from 'busboy'
import * as fs from 'fs'

const SAMPLE4: string = 'sample4'

export const upload = async (request: express.Request, response: express.Response) => {
  // https://qiita.com/rubytomato@github/items/11c7f3fcaf60f5ce3365
  console.log('start.')
  const busboy = new Busboy({ headers: request.headers })
  // This object will accumulate all the uploaded files, keyed by their name.
  const uploads: any = {}
  const tmpdir = os.tmpdir()

  // This callback will be invoked for each file uploaded.
  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    console.log('busboy.on.file start.')
    // console.log(fieldname)
    // Note that os.tmpdir() is an in-memory file system, so should
    // only be used for files small enough to fit in memory.
    const filepath = path.join(tmpdir, filename)
    uploads[fieldname] = filepath
    file.pipe(fs.createWriteStream(filepath))

    file.on('end', async () => {
      console.log('file.on.end start.')
      console.log('upload file: ' + filepath + ' metadata: ' + mimetype)

      const datas: any[] = await excel2Sample4(filepath)
      for (const instance of datas) {
        admin.firestore().doc(`${SAMPLE4}/${instance.operationId}`).set(instance)
      }
      response.json(datas)

      // response.status(200).send('OK!')
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