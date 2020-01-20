import { Request, Response } from 'express'
import * as admin from 'firebase-admin'

import { excel2Sample4 } from './sample4'

import * as path from 'path'
import * as os from 'os'
import * as Busboy from 'busboy'
import * as fs from 'fs'

const SAMPLE4: string = 'sample4'

export const upload = async (request: Request, response: Response) => {
  // https://cloud.google.com/functions/docs/writing/http?hl=ja
  // https://qiita.com/rubytomato@github/items/11c7f3fcaf60f5ce3365
  console.log('start.')

  // Node.js doesn't have a built-in multipart/form-data parsing library.
  // Instead, we can use the 'busboy' library from NPM to parse these requests.
  const busboy = new Busboy({ headers: request.headers })
  const tmpdir = os.tmpdir()

  // This object will accumulate all the uploaded files, keyed by their name.
  const uploads: { [key: string]: string } = {}
  const fileWrites: Array<Promise<any>> = []

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    // file: NodeJS.ReadableStream

    console.log('busboy.on.file start.')
    console.log(`File [${fieldname}]: filename: ${filename}, encoding: ${encoding} , mimetype: ${mimetype}`)

    // Note: os.tmpdir() points to an in-memory file system on GCF
    // Thus, any files in it must fit in the instance's memory.
    const filepath = path.join(tmpdir, filename)
    uploads[fieldname] = filepath

    const writeStream = fs.createWriteStream(filepath)
    file.pipe(writeStream)

    // File was processed by Busboy; wait for it to be written to disk.
    const promise = new Promise((resolve, reject) => {
      file.on('end', () => {
        writeStream.end()
        excel2Sample4(filepath)
          .then((datas: any[]) => {
            for (const instance of datas) {
              admin
                .firestore()
                .doc(`${SAMPLE4}/${instance.operationId}`)
                .set(instance)
            }
            resolve(datas)
          })
          .catch(err => reject(err))
      })
      // writeStream.on('finish', resolve)
      // writeStream.on('error', reject)
    })
    fileWrites.push(promise)
  })

  // Triggered once all uploaded files are processed by Busboy.
  // We still need to wait for the disk writes (saves) to complete.
  busboy.on('finish', async () => {
    console.log('busboy.on.finish start.')
    const results: any[] = await Promise.all(fileWrites)

    for (const file of Object.values(uploads)) {
      fs.unlinkSync(file)
    }
    const length = results
      .map(result => result.length)
      .reduce((acc, value) => acc + value)
    // response.status(200).send(`${Object.keys(uploads).length} file executed.`)
    response.status(200).send(`${length} 件処理しました。`)
  })

  const reqex: any = request
  busboy.end(reqex.rawBody)
}
