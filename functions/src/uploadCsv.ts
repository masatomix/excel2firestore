import { Request, Response } from 'express'
import * as admin from 'firebase-admin'

import * as Busboy from 'busboy'
import * as iconv from 'iconv-lite'
import * as csv from 'csvtojson'
import { format_func } from './sample4'

const SAMPLE4: string = 'sample4'

export const upload = async (request: Request, response: Response) => {
  // https://cloud.google.com/functions/docs/writing/http?hl=ja
  // https://qiita.com/rubytomato@github/items/11c7f3fcaf60f5ce3365
  console.log('start.')

  // Node.js doesn't have a built-in multipart/form-data parsing library.
  // Instead, we can use the 'busboy' library from NPM to parse these requests.
  const busboy = new Busboy({ headers: request.headers })

  // This object will accumulate all the uploaded files, keyed by their name.
  // const uploads: { [key: string]: string } = {}
  const fileWrites: Array<Promise<any>> = []

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    // file: NodeJS.ReadableStream
    console.log('busboy.on.file start.')
    console.log(`File [${fieldname}]: filename: ${filename}, encoding: ${encoding} , mimetype: ${mimetype}`)

    // File was processed by Busboy; wait for it to be written to disk.
    const promise = new Promise((resolve, reject) => {
      const datas: any[] = []
      file
        .pipe(iconv.decodeStream('Shift_JIS'))
        .pipe(iconv.encodeStream('utf-8'))
        .pipe(
          csv().on('data', (data) => {
            const row = Buffer.isBuffer(data) ? JSON.parse(data.toString()) : JSON.parse(data)
            datas.push(row)
          }),
        )
        .on('end', () => {
          console.log(`${filename}から${datas.length}件`)
          const tmpPs: Array<Promise<any>> = []
          const converted = datas.map(format_func)
          console.table(converted)
          for (const instance of converted) {
            console.log(`${instance.operationId} 処理します`)
            tmpPs.push(admin.firestore().doc(`${SAMPLE4}/${instance.operationId}`).set(instance))
          }
          Promise.all(tmpPs).then(() => resolve(datas)).catch(()=>reject())
        })
    })
    fileWrites.push(promise)
  })

  // Triggered once all uploaded files are processed by Busboy.
  // We still need to wait for the disk writes (saves) to complete.
  busboy.on('finish', async () => {
    console.log('busboy.on.finish start.')
    console.log(`promiseは ${fileWrites.length} 件`)
    const results: any[] = await Promise.all(fileWrites)
    console.log(`結果は ${results.length} 件`)

    // for (const file of Object.values(uploads)) {
    //   fs.unlinkSync(file)
    // }
    const length = results.map((result) => result.length).reduce((acc, value) => acc + value)
    // response.status(200).send(`${Object.keys(uploads).length} file executed.`)
    response.status(200).send(`${length} 件処理しました。`)
  })

  const reqex: any = request
  busboy.end(reqex.rawBody)
}
