import { Request, Response } from 'express'
import * as admin from 'firebase-admin'

import { getSample4Promise } from './sample4'

import * as path from 'path'
import * as os from 'os'

const SAMPLE4: string = 'sample4'
// import xPopWrapper = require('xlsx-populate-wrapper')
const XlsxPopulate = require('xlsx-populate')

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

    const datas = await getSample4Promise()

    // const workbook = new xPopWrapper(fullPath)
    // await workbook.init()

    // const rowCount = await addRow(workbook)
    // applyStyles(workbook, rowCount)

    const newFileName = 'download.xlsx'
    const newFilePath = path.join(os.tmpdir(), newFileName)
    await internalSave2Excel(datas, newFilePath, fullPath, SAMPLE4, applyStyles)

    // 書き込んだファイルを保存
    // await workbook.commit(newFilePath)
    console.log(newFilePath)

    response.download(newFilePath, newFileName)
  } catch (error) {
    console.log(error)
    response.status(500).send(error)
  }
}

// const addRow = async (workbook: any): Promise<number> => {
//   const datas = await getSample4Promise()

//   const convertedDatas = datas.map(data =>
//     Object.assign(data, {
//       isUnplanned: String(data.isUnplanned) // Booleanだけは、Excelでfalseが表示出来ず。文字列化することにした。
//     })
//   )

//   workbook.update(SAMPLE4, convertedDatas) // 更新
//   return datas.length
// }

// https://www.npmjs.com/package/xlsx-populate#style-reference
// https://support.office.com/en-us/article/Number-format-codes-5026bbd6-04bc-48cd-bf33-80f18b4eae68?ui=en-US&rs=en-US&ad=US
// https://www.tipsfound.com/vba/07015
const applyStyles = (instances: any[], workbook: any, sheetName: string): void => {
  const rowCount = instances.length
  const sheet = workbook.sheet(SAMPLE4)
  sheet.range(`D2:D${rowCount + 1}`).style('numberFormat', '@') // 書式: 文字(コレをやらないと、見かけ上文字だが、F2で抜けると数字になっちゃう)
  sheet.range(`G2:G${rowCount + 1}`).style('numberFormat', '@') // 書式: 文字(コレをやらないと、見かけ上文字だが、F2で抜けると数字になっちゃう)
  sheet.range(`E2:F${rowCount + 1}`).style('numberFormat', 'yyyy/mm/dd') // 書式: 日付
  sheet.range(`H2:H${rowCount + 1}`).style('numberFormat', 'yyyy/mm/dd hh:mm') // 書式: 日付+時刻

  // データのある行に、罫線を引く
  sheet.range(`A2:I${rowCount + 1}`).style('border', {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  })
}

/**
 * 引数のJSON配列を、指定したテンプレートを用いて、指定したファイルに出力します。
 * @param instances JSON配列
 * @param outputFullPath 出力Excelのパス
 * @param templateFullPath 元にするテンプレートExcelのパス
 * @param sheetName テンプレートExcelのシート名
 * @param applyStyles 出力時のExcelを書式フォーマットしたい場合に使用する。
 */
export const internalSave2Excel = async (
  instances: any[],
  outputFullPath: string,
  templateFullPath: string,
  sheetName: string,
  applyStyles_?: (instances: any[], workbook: any, sheetName: string) => void,
): Promise<string> => {
  // logger.debug(`template path: ${templateFullPath}`)
  // console.log(instances[0])
  // console.table(instances)

  let headings: string[] = []
  let workbook: any
  if (templateFullPath !== '') {
    // 指定された場合は、一行目の文字列群を使ってプロパティを作成する
    workbook = await XlsxPopulate.fromFileAsync(templateFullPath)
    headings = getHeaders(workbook, sheetName)
  } else {
    // templateが指定されない場合は、空ファイルをつくり、オブジェクトのプロパティでダンプする。
    workbook = await XlsxPopulate.fromBlankAsync()
    if (instances.length > 0) {
      headings = Object.keys(instances[0])
    }
  }

  if (instances.length > 0) {
    const csvArrays: any[][] = createCsvArrays(headings, instances)
    // console.table(csvArrays)
    const rowCount = instances.length
    const columnCount = headings.length
    const sheet = workbook.sheet(sheetName)

    if (sheet.usedRange()) {
      sheet.usedRange().clear() // Excel上のデータを削除して。
    }
    sheet.cell('A1').value(csvArrays)

    // データがあるところには罫線を引く(細いヤツ)
    const startCell = sheet.cell('A1')
    const endCell = startCell.relativeCell(rowCount, columnCount - 1)

    sheet.range(startCell, endCell).style('border', {
      top: { style: 'hair' },
      left: { style: 'hair' },
      bottom: { style: 'hair' },
      right: { style: 'hair' },
    })

    // よくある整形パタン。
    // sheet.range(`C2:C${rowCount + 1}`).style('numberFormat', '@') // 書式: 文字(コレをやらないと、見かけ上文字だが、F2で抜けると数字になっちゃう)
    // sheet.range(`E2:F${rowCount + 1}`).style('numberFormat', 'yyyy/mm/dd') // 書式: 日付
    // sheet.range(`H2:H${rowCount + 1}`).style('numberFormat', 'yyyy/mm/dd hh:mm') // 書式: 日付+時刻

    if (applyStyles_) {
      applyStyles_(instances, workbook, sheetName)
    }
  }

  // logger.debug(outputFullPath)
  await workbook.toFileAsync(outputFullPath)

  return toFullPath(outputFullPath)
}

const toFullPath = (str: string) => {
  let ret = ''
  if (path.isAbsolute(str)) {
    ret = str
  } else {
    ret = path.join(path.resolve(''), str)
  }
  return ret
}

// XlsxPopulate
export const getHeaders = (workbook: any, sheetName: string): string[] => {
  return workbook.sheet(sheetName).usedRange().value().shift()
}

// XlsxPopulate
export const getValuesArray = (workbook: any, sheetName: string): any[][] => {
  const valuesArray: any[][] = workbook.sheet(sheetName).usedRange().value()
  valuesArray.shift() // 先頭除去
  return valuesArray
}

// 自前実装
function createCsvArrays(headings: string[], instances: any[]) {
  const csvArrays: any[][] = instances.map((instance: any): any[] => {
    // console.log(instance)
    const csvArray = headings.reduce((box: any[], header: string): any[] => {
      // console.log(`${instance[header]}: ${instance[header] instanceof Object}`)
      // console.log(`${typeof instance[header]} [${instance[header]}]`)
      // console.log(instance[header] instanceof Date) 
      if (instance[header] instanceof Object) {
        // box.push(JSON.stringify(instance[header])) // flagで選べるようにしたい
        box.push(instance[header])
      } else {
        box.push(instance[header])
      }
      return box
    }, [])
    return csvArray
  })
  csvArrays.unshift(headings)
  return csvArrays
}
