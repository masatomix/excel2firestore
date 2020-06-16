import { Request, Response } from 'express'
import * as admin from 'firebase-admin'

import { excel2json } from 'excel-csv-read-write'

const SAMPLE3: string = 'sample3'
const targetExcelFile: string = './samples.xlsx'

export const postSample3 = async (request: Request, response: Response) => {
  const datas: any[] = await excel2Sample3()
  for (const instance of datas) {
    admin.firestore().collection(SAMPLE3).doc(instance['codeType'])
      .collection('code').doc(instance['code'])
      .set(instance)
  }
  response.json(datas)
}

export const getSample3 = async (request: Request, response: Response) => {
  const snapshot = await admin.firestore().collection(`${SAMPLE3}/fooStatus/code/`).get()
  const returnArray: any = []
  snapshot.forEach(docref => returnArray.push(docref.data()))
  return response.json(returnArray)
}


const excel2Sample3 = (): Promise<Array<any>> => {
  const format_func = (instance: any): any => {
    const now = admin.firestore.Timestamp.now()
    // 複数のオブジェクトのプロパティから、一つのオブジェクトを作成する定石ぽい
    const ret = Object.assign(instance, {
      code: String(instance['code']),
      value_ext: instance['value_ext'] ? instance['value_ext'] : null,
      description: instance['description'] ? instance['description'] : null,
      description2: instance['description2'] ? instance['description2'] : null,
      createdAt: now,
      updatedAt: now,
    })
    return ret
  }
  return excel2json(targetExcelFile, SAMPLE3, format_func)

}