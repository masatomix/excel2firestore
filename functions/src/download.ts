import { Request, Response } from 'express'
import * as admin from 'firebase-admin'

import { getSample4Promise } from './sample4'

import * as path from 'path'
import * as os from 'os'

const SAMPLE4: string = 'sample4'
import xPopWrapper = require('xlsx-populate-wrapper')


export const download = async (request: Request, response: Response) => {

  const bucket = admin.storage().bucket()
  const fileName = 'output.xlsx'
  const fullPath = path.join(os.tmpdir(), fileName)
  try {
    await bucket.file(fileName).download({
      destination: fullPath,
    })
    // ファイル読み込み
    console.log(fullPath)
    const workbook = new xPopWrapper(fullPath)
    await workbook.init()

    const rowCount = await addRow(workbook)
    applyStyles(workbook, rowCount)

    const newFileName = 'download.xlsx'
    const newFilePath = path.join(os.tmpdir(), newFileName)

    // 書き込んだファイルを保存
    await workbook.commit(newFilePath)
    console.log(newFilePath)

    response.download(newFilePath, newFileName)
  } catch (error) {
    console.log(error)
    response.status(500).send(error)
  }
}

const addRow = async (workbook: any): Promise<number> => {
  const datas = await getSample4Promise()

  const convertedDatas = datas.map(data =>
    Object.assign(data, {
      isUnplanned: String(data.isUnplanned) // Booleanだけは、Excelでfalseが表示出来ず。文字列化することにした。
    })
  )

  workbook.update(SAMPLE4, convertedDatas) // 更新
  return datas.length
}
// https://www.npmjs.com/package/xlsx-populate#style-reference
// https://support.office.com/en-us/article/Number-format-codes-5026bbd6-04bc-48cd-bf33-80f18b4eae68?ui=en-US&rs=en-US&ad=US
// https://www.tipsfound.com/vba/07015
const applyStyles = (workbook: any, rowCount: number) => {
  const sheet = workbook.getWorkbook().sheet(SAMPLE4)
  sheet.range(`D2:D${rowCount + 1}`).style('numberFormat', '@') // 書式: 文字(コレをやらないと、見かけ上文字だが、F2で抜けると数字になっちゃう)
  sheet.range(`G2:G${rowCount + 1}`).style('numberFormat', '@') // 書式: 文字(コレをやらないと、見かけ上文字だが、F2で抜けると数字になっちゃう)
  sheet.range(`E2:F${rowCount + 1}`).style('numberFormat', 'yyyy/mm/dd') // 書式: 日付
  sheet.range(`H2:H${rowCount + 1}`).style('numberFormat', 'yyyy/mm/dd hh:mm') // 書式: 日付+時刻

  // データのある行に、罫線を引く
  sheet.range(`A2:I${rowCount + 1}`).style('border', {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  })
}
