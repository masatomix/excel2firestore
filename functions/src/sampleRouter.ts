import * as express from 'express'
import { getSample1, getSample2, postSample1, postSample2 } from './sample1'
import { getSample3, postSample3 } from './sample3'
import { getSample4, postSample4 } from './sample4'

const router = express.Router()
router
  /**
   * sample1.
   * 
   * POSTでは、
   * シンプルに、Excelデータを行単位で読み込んで、そのままFirestoreへ書き込むサンプル。
   * 行データには「driverId」というフィールドがあり、それをFirestoreのキーとして指定。
   * 
   * GETでは、そのデータを取得して、そのままReturn。
   */
  .post('/sample1', postSample1)
  .get('/sample1', getSample1)

  /**
   * sample2.
   * 
   * POSTでは、
   * Excelデータを行単位で読み込んで、行ごとに整形して、それをFirestoreへ書き込み。
   * 
   * GETでは、そのデータをFirestoreから取得して、Return。
   */
  .post('/sample2', postSample2)
  .get('/sample2', getSample2)

  /**
   * sample3.
   * 
   * POSTでは、
   * Excelデータを行単位で読み込んで、行ごとに整形して、それをFirestoreへ書き込み。
   * Excelから数字を読み込むと書式が文字でも数字になってしまうので、関数で変換している。
   * Firestoreは、DocumentIDに数値を使えないので文字列変換をしたり、
   * Firestoreは、undefined を取り込めないので、nullに置換している。
   * 
   * GETでは、そのデータをFirestoreから取得して、Return。
   */
  .post('/sample3', postSample3)
  .get('/sample3', getSample3)

  /**
   * sample4.
   * 
   * POSTでは、
   * Excelデータを行単位で読み込んで、行ごとに整形して、それをFirestoreへ書き込み。
   * Excelから数字を読み込むと書式が文字でも数字になってしまうので、関数で変換している。
   * Firestoreは、DocumentIDに数値を使えないので文字列変換をしたり、
   * Firestoreは、undefined を取り込めないので、nullに置換している。
   * 
   * GETでは、そのデータをFirestoreから取得して、Return。
   */
  .post('/sample4', postSample4)
  .get('/sample4', getSample4)


export default router
