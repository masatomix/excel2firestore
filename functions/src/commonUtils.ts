// import xPopWrapper = require('xlsx-populate-wrapper')

import { getHeaders, getValuesArray } from './download'

const XlsxPopulate = require('xlsx-populate')

// /**
//  * Excelファイルを読み込み、各行をデータとして配列で返すメソッド。
//  * @param path Excelファイルパス
//  * @param sheet シート名
//  * @param format_func フォーマット関数。instanceは各行データが入ってくるので、任意に整形して返せばよい
//  */
// export const xlsx2json = async function (path: string, sheet: string, format_func?: (instance: any) => any): Promise<Array<any>> {
//   const workbook = new xPopWrapper(path)
//   await workbook.init()

//   const instances: Array<any> = workbook.getData(sheet)
//   if (format_func) {
//     return instances.map(instance => format_func(instance))
//   }
//   return instances
// }


/**
 * Excelファイルを読み込み、各行をデータとして配列で返すメソッド。
 * @param path Excelファイルパス
 * @param sheet シート名
 * @param format_func フォーマット関数。instanceは各行データが入ってくるので、任意に整形して返せばよい
 */
export const xlsx2json = async (
  inputFullPath: string,
  sheetName = 'Sheet1',
  format_func?: (instance: any) => any,
): Promise<Array<any>> => {
  const workbook: any = await XlsxPopulate.fromFileAsync(inputFullPath)
  const headings: string[] = getHeaders(workbook, sheetName)
  // console.log(headings.length)
  const valuesArray: any[][] = getValuesArray(workbook, sheetName)

  const instances = valuesArray.map((values: any[]) => {
    return values.reduce((box: any, column: any, index: number) => {
      // 列単位で処理してきて、ヘッダの名前で代入する。
      box[headings[index]] = column
      return box
    }, {})
  })

  if (format_func) {
    return instances.map((instance) => format_func(instance))
  }
  return instances
}




/**
 * Excelのシリアル値を、Dateへ変換します。
 * @param serialNumber シリアル値
 */
export const dateFromSn = (serialNumber: number): Date => {
  return XlsxPopulate.numberToDate(serialNumber)
}

export const toBoolean = function (boolStr: string | boolean): boolean {
  if (typeof boolStr === 'boolean') {
    return boolStr
  }
  return boolStr.toLowerCase() === 'true'
}