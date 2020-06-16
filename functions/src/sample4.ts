import { Request, Response } from 'express'
import * as admin from 'firebase-admin'

import { excelStream2json, excel2json, dateFromSn, toBoolean } from 'excel-csv-read-write'

const SAMPLE1: string = 'sample1'
const SAMPLE4: string = 'sample4'
const targetExcelFile: string = './samples.xlsx'

export const postSample4 = async (request: Request, response: Response) => {
  const datas: any[] = await excel2Sample4(targetExcelFile)
  for (const instance of datas) {
    // console.log(instance)
    admin.firestore().doc(`${SAMPLE4}/${instance.operationId}`).set(instance)
  }
  response.json(datas)
}

type QuerySnapshot = admin.firestore.QuerySnapshot
type DocumentSnapshot = admin.firestore.DocumentSnapshot

export const getSample4 = async (request: Request, response: Response) => {
  const returnArray = await getSample4Promise()
  return response.json(returnArray)
}

export const getSample4Promise = async (): Promise<Array<any>> => {
  const returnArray: any = []

  const snapshot: QuerySnapshot = await admin.firestore().collection(SAMPLE4).get()
  snapshot.forEach((docref: DocumentSnapshot) => {
    const orgData = docref.data()! // nullはない、と仮定
    // プロパティを再定義。
    const data = Object.assign(orgData, {
      opeDateFrom: orgData.opeDateFrom.toDate(),
      opeDateTo: orgData.opeDateTo.toDate(),
      destinationDate: orgData.destinationDate.toDate(),
      createdAt: orgData.createdAt.toDate(),
      updatedAt: orgData.updatedAt.toDate(),

      driverId: orgData.driver.ref.id,
      driver: orgData.driver.ref,
    })

    // ちなみにdriverプロパティを使って、こう表示が出来る
    data.driver.get().then((driverSnapshot: DocumentSnapshot) => console.log(driverSnapshot.data()))
    returnArray.push(data)
  })
  return returnArray
}


const format_func = (instance: any): any => {
  const now = admin.firestore.Timestamp.now()
  const data: any = {
    operationId: instance.operationId,
    driver: {
      ref: admin.firestore().doc(`${SAMPLE1}/${instance.driverId}`),
    },
    opeType: String(instance.opeType),
    opeDateFrom: dateFromSn(instance.opeDateFrom),
    opeDateTo: dateFromSn(instance.opeDateTo),
    opeStatus: String(instance.opeStatus),
    destinationDate: dateFromSn(instance.destinationDate),
    isUnplanned: toBoolean(instance.isUnplanned),
    createdAt: now,
    updatedAt: now,
  }
  return data
}

const excel2Sample4 = (path: string): Promise<Array<any>> => {
  return excel2json(path, SAMPLE4, format_func)
}

export const excelStream2Sample4 = (file: any): Promise<Array<any>> => {
  return excelStream2json(file, SAMPLE4, format_func)
}
