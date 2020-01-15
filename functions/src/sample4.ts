import * as express from 'express'
import * as admin from 'firebase-admin'

import { xlsx2json, dateFromSn, toBoolean } from './commonUtils'

const SAMPLE1: string = 'sample1'
const SAMPLE4: string = 'sample4'
const targetExcelFile: string = './samples.xlsx'

export const postSample4 = async (request: express.Request, response: express.Response) => {
  const datas: any[] = await excel2Sample4()
  for (const instance of datas) {
    // console.log(instance)
    admin.firestore().doc(`${SAMPLE4}/${instance.operationId}`).set(instance)
  }
  response.json(datas)
}

export const getSample4 = async (request: express.Request, response: express.Response) => {
  const snapshot = await admin.firestore().collection(SAMPLE4).get()
  const returnArray: any = []
  snapshot.forEach(docref => returnArray.push(docref.data()))
  return response.json(returnArray)
}

const excel2Sample4 = (): Promise<Array<any>> => {
  const format_func = (instance: any): any => {
    const now = admin.firestore.Timestamp.now()
    const data: any = {
      operationId: instance.operationId,
      driver: {
        ref: admin.firestore().doc(`${SAMPLE1}/${instance.driverId}`)
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
  return xlsx2json(targetExcelFile, SAMPLE4, format_func)

  // for (const data of datas) {
  //   admin.firestore()
  //     .doc(`${SAMPLE4}/${data.instance.operationId}`)
  //     .set(data)
  //   await new OperationService(admin).createOperation(data.companyCode, data.instance)
  //   operationIds.push(data.instance.operationId)
  // }
  // return operationIds
}
