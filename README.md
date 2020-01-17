# excel2firestore

Cloud Functions for Firebase を使った、Excelファイル上のデータをCloud Firestoreへ投入するサンプル集です。

下記のことができるようになります。

- Excelデータを、Firestoreへ
- Firestoreデータを、整形されたExcelへ
- Excelファイルを、Storageへ


## Excelデータを、Firestoreへ
ローカルのExcelファイルを、Cloud Functionsへアップロード。FunctionsはExcelファイルを読み込んで、JSONデータを生成し、Firestoreにデータを書き込みます。

![upload.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/205f15ff-8a12-b7b5-9221-1eeb449a6f06.png)

呼び出すコマンドはこんな感じ。

```
curl http://localhost:5000/fb2samples/us-central1/api/samples/upload -F file=@samples.xlsx -X POST
```

## Firestoreデータを、整形されたExcelへ
Cloud Functionsを呼び出すとFunctionsがFirestoreからデータを取得。またCloud Storageに置いたテンプレートExcelファイルを取り出して、そこにデータを書き込みExcelファイルをダウンロードします。

![download.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/bb1ebc70-81e9-8ec6-ae51-047cba1cddba.png)

```
curl http://localhost:5000/fb2samples/us-central1/api/samples/download -o result.xlsx
```

## Excelファイルを、Storageへ
ついでに、テンプレートのExcelをCloud Functions経由で、Cloud Storageへアップロードします。

![uploadTemplate.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/83ba1cf1-de69-a245-9c3d-3d4bc4d54d8f.png)

```
curl http://localhost:5000/fb2samples/us-central1/api/samples/templateUpload -F file=@samples.xlsx -X POST
```

## 前提

```
$ node --version
v10.16.2

$ firebase --version
7.12.1

$ firebase login
Already logged in as xxxx@example.com

$ firebase use
Active Project: default  (fb2samples)

Project aliases for /Users/xx/git/excel2firestore:

* default  (fb2samples)

Run firebase use --add to define a new project alias.
$
```

その他、

- Cloud Functions for Firebase が利用可能な状態であること
- Cloud Storage が利用可能な状態であること
- Cloud Firestore が利用可能な状態であること


FunctionsからFirestoreへ読み書きを行うために「サービスアカウントJSONファイル」が必要です。
Firebaseのプロジェクトの左メニューの歯車アイコンから「プロジェクトの設定」を選択 >> サービスアカウント 画面でJSONファイルを生成・取得しておいてください。
(ソースコード上の ``./functions/src/firebase-adminsdk.json``という名前で配置)


## その他データを投入するサンプル

```
curl http://localhost:5000/fb2samples/us-central1/api/samples/sample1
curl http://localhost:5000/fb2samples/us-central1/api/samples/sample1 -X POST

curl http://localhost:5000/fb2samples/us-central1/api/samples/sample2
curl http://localhost:5000/fb2samples/us-central1/api/samples/sample2 -X POST

curl http://localhost:5000/fb2samples/us-central1/api/samples/sample3
curl http://localhost:5000/fb2samples/us-central1/api/samples/sample3 -X POST

curl http://localhost:5000/fb2samples/us-central1/api/samples/sample4
curl http://localhost:5000/fb2samples/us-central1/api/samples/sample4 -X POST
```


## 改訂履歴

- 0.0.5 Excelをアップロードするサンプルを追加。
- 0.0.4 Excelをアップロードするサンプルを追加。
- 0.0.3 Storageに置いてあるExcelファイルを取得し、Firestoreからとってきたデータを埋め込んで、ダウンロードするサンプルを追加。functions/output.xlsx をBucketにアップロードしておいてください。
- 0.0.2 Firestoreから取得したデータを整形するサンプルを追加。
- 0.0.1 初版。Firebase Cloud Functionsを使ったexcelデータをFirestoreへ投入するサンプル
