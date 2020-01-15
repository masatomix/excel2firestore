import * as express from 'express'
import * as admin from 'firebase-admin'

import { xlsx2json } from './commonUtils'

const SAMPLE1: string = 'sample1'
const SAMPLE2: string = 'sample2'
const targetExcelFile: string = './samples.xlsx'

export const postSample1 = async (request: express.Request, response: express.Response) => {
  // insert
  const datas: any[] = await excel2Sample1()
  for (const instance of datas) {
    admin.firestore().doc(`${SAMPLE1}/${instance.driverId}`).set(instance)
  }
  response.json(datas)
}

export const getSample1 = async (request: express.Request, response: express.Response) => {
  const snapshot = await admin.firestore().collection(SAMPLE1).get()
  const returnArray: any = []
  snapshot.forEach(docref => returnArray.push(docref.data()))
  return response.json(returnArray)
}

export const postSample2 = async (request: express.Request, response: express.Response) => {
  const datas: any[] = await excel2Sample2()
  for (const instance of datas) {
    admin.firestore().doc(`${SAMPLE2}/${instance.driver.driverId}`).set(instance)
  }
  response.json(datas)
}

export const getSample2 = async (request: express.Request, response: express.Response) => {
  const snapshot = await admin.firestore().collection(SAMPLE2).get()
  const returnArray: any = []
  snapshot.forEach(docref => returnArray.push(docref.data()))
  return response.json(returnArray)
}

// 備忘:関数書き方1
const excel2Sample1 = (): Promise<Array<any>> => {
  return xlsx2json(targetExcelFile, SAMPLE1)
}

// 備忘:関数書き方2
function excel2Sample2(): Promise<Array<any>> {
  type Data = { companyCode: string; driver: any }
  const format_func = (instance: any): Data => {
    const now = admin.firestore.Timestamp.now()
    const data: Data = {
      companyCode: instance.companyCode,
      driver: {
        driverId: instance.driverId,
        driverName: instance.name,
        createdAt: now,
        updatedAt: now,
      },
    }
    return data
  }
  return xlsx2json(targetExcelFile, SAMPLE1, format_func)
}