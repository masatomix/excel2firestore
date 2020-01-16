# excel2firestore
Firebase Cloud Functionsを使ったexcelデータをFirestoreへ投入するサンプル


```
curl http://localhost:5000/fb2samples/us-central1/api/samples/sample1
curl http://localhost:5000/fb2samples/us-central1/api/samples/sample1 -X POST


curl http://localhost:5000/fb2samples/us-central1/api/samples/sample2
curl http://localhost:5000/fb2samples/us-central1/api/samples/sample2 -X POST


curl http://localhost:5000/fb2samples/us-central1/api/samples/sample3
curl http://localhost:5000/fb2samples/us-central1/api/samples/sample3 -X POST


curl http://localhost:5000/fb2samples/us-central1/api/samples/sample4
curl http://localhost:5000/fb2samples/us-central1/api/samples/sample4 -X POST


curl http://localhost:5000/fb2samples/us-central1/api/samples/download -o result.xlsx

curl http://localhost:5000/fb2samples/us-central1/api/samples/upload -F file=@samples.xlsx -X POST
```


## 改訂履歴

- 0.0.4 Excelをアップロードするサンプルを追加。
- 0.0.3 Storageに置いてあるExcelファイルを取得し、Firestoreからとってきたデータを埋め込んで、ダウンロードするサンプルを追加。functions/output.xlsx をBucketにアップロードしておいてください。
- 0.0.2 Firestoreから取得したデータを整形するサンプルを追加。
- 0.0.1 初版。Firebase Cloud Functionsを使ったexcelデータをFirestoreへ投入するサンプル
