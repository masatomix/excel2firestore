# excel2firestore

## イントロ

Cloud Functions for Firebase を使った、Excelファイル上のデータをCloud Firestoreへ投入するサンプル集です。

以下のことができるようになります。

- Excelデータを読み込んで、Firestoreへ保存
- Firestoreデータを読み出して、Excelへ流し込んでダウンロード。
- Excelファイルを、Storageへアップロード(上記で用いるExcelテンプレートをアップロード)

それぞれ、図的には下記のようになります。

### Excelデータを読み込んで、Firestoreへ保存
ローカルのExcelファイルを、Cloud Functionsへアップロード。FunctionsはExcelファイルを読み込んでJSONデータを生成し、Firestoreにデータを書き込みます。

![upload.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/205f15ff-8a12-b7b5-9221-1eeb449a6f06.png)


### Firestoreデータを読み出して、Excelへ流し込んでダウンロード。
Cloud Functionsを呼び出すとFunctionsがFirestoreからデータを取得。またCloud Storageに置いたテンプレートExcelファイルを取り出してそこにデータを書き込み、Excelファイルをダウンロードします。

![download.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/bb1ebc70-81e9-8ec6-ae51-047cba1cddba.png)


### Excelファイルを、Storageへアップロード(上記で用いるExcelテンプレートをアップロード)
ついでに、テンプレートのExcelをCloud Functions経由で、Cloud Storageへアップロードします。

![uploadTemplate.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/83ba1cf1-de69-a245-9c3d-3d4bc4d54d8f.png)


## 前提、環境構築(メモ)

Node.js はインストールされてる前提で、firebase-toolsのインストールから。

```
$ node --version
v10.18.1

$ npm i -g firebase-tools

+ firebase-tools@7.12.1
added 516 packages from 325 contributors in 20.769s

$ firebase --version
7.12.1
```

続いてFirebaseへのログイン。下記のコマンドを実行するとブラウザが起動するので、そちらでFirebaseにログインしておきます。

```
$ firebase login

✔  Success! Logged in as xxxx@example.com
```

今回のサンプルのコードをGitHubからダウンロードして、使用するFirebaseのプロジェクトを設定しておきます。

```
$ git clone https://github.com/masatomix/excel2firestore.git --branch develop
$ cd excel2firestore/

$ firebase use --add
? Which project do you want to add? slackapp-sample
? What alias do you want to use for this project? (e.g. staging) default

Created alias default for slackapp-sample.
Now using alias default (slackapp-sample)
$ 
```

その他Firebase上で

- Cloud Functions for Firebase が利用可能な状態
- Cloud Storage が利用可能な状態
- Cloud Firestore が利用可能な状態

にしておきましょう[^1]。

[^1]: Functionsからの処理なので、Security Rulesは気にしなくてよい、、はず。


## 環境設定

### サービスアカウント設定
FunctionsからFirestoreへ読み書きを行うために「サービスアカウントJSONファイル」が必要です。
Firebaseのプロジェクトの左メニューの歯車アイコンから「プロジェクトの設定」を選択 >> サービスアカウント 画面でJSONファイルを生成・取得しておいてください。
![0002.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/582b9820-15e5-e2a8-ef01-99edde4b3bd1.png)

その後、ソースコード上の ``./functions/src/firebase-adminsdk.json``という名前で配置しておいてください。

### Storageの設定

StorageのURLを指定します。Firebaseのプロジェクトの左メニュー >> Storage を選択。

![0001.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/73777/67b8103e-9d22-1c33-9a00-7051fae1e443.png)


``gs://slackapp-sample.appspot.com`` がStorageのURLなのでそれを設定します。

```
$ cd functions/
$ cat ./src/firebaseConfig.ts
export default {
  apiKey: '',
  authDomain: '',
  databaseURL: 'https://slackapp-sample.firebaseio.com', ←今回使いません
  projectId: 'slackapp-sample',          ←今回使いません
  storageBucket: 'slackapp-sample.appspot.com',    ← 正しいStorage名に。
  messagingSenderId: '',
  appId: ''
}
```

以上で準備は完了です。


## Functionsを起動し、実行する

```
$ npm i
...
found 0 vulnerabilities

$ npm run serve

> functions@0.0.6-SNAPSHOT serve /Users/xxx/excel2firestore/functions
> npm run build && firebase serve --only functions


> functions@0.0.6-SNAPSHOT build /Users/xxx/excel2firestore/functions
> tsc

⚠  Your requested "node" version "8" doesn't match your global version "10"
✔  functions: Emulator started at http://localhost:5000
i  functions: Watching "/Users/xxx/excel2firestore/functions" for Cloud Functions...
✔  functions[api]: http function initialized (http://localhost:5000/slackapp-sample/us-central1/api).
```

起動したら別のターミナルから。。

```
$ pwd
/Users/xxx/excel2firestore/functions
$
```


- Excelデータを、Firestoreへ
    - ``$ curl http://localhost:5000/slackapp-sample/us-central1/api/samples/upload -F file=@samples.xlsx -X POST``
- Firestoreデータを、整形されたExcelへ
    - ``$ curl http://localhost:5000/slackapp-sample/us-central1/api/samples/download -o result.xlsx``
- Excelファイルを、Storageへ
    - ``$ curl http://localhost:5000/slackapp-sample/us-central1/api/samples/templateUpload -F file=@samples.xlsx -X POST``



### その他データを投入するサンプル

その他、Functionsとともに配置済みのExcelファイルからデータを取り出し、データを読み書きするサンプルです。(説明は割愛します。)

```
curl http://localhost:5000/slackapp-sample/us-central1/api/samples/sample1 -X POST
curl http://localhost:5000/slackapp-sample/us-central1/api/samples/sample1

curl http://localhost:5000/slackapp-sample/us-central1/api/samples/sample2 -X POST
curl http://localhost:5000/slackapp-sample/us-central1/api/samples/sample2

curl http://localhost:5000/slackapp-sample/us-central1/api/samples/sample3 -X POST
curl http://localhost:5000/slackapp-sample/us-central1/api/samples/sample3

curl http://localhost:5000/slackapp-sample/us-central1/api/samples/sample4 -X POST
curl http://localhost:5000/slackapp-sample/us-central1/api/samples/sample4
```


## コード説明

基本的なFunctionsのコードは省略します。



- Excelデータを読み込んで、Firestoreへ保存
- Firestoreデータを読み出して、Excelへ流し込んでダウンロード。
- Excelファイルを、Storageへアップロード(上記で用いるExcelテンプレートをアップロード)






## 改訂履歴

- 0.0.5 firebase-tools群のバージョンアップと、サービスアカウントの追加、Storageへアップするサンプルの追加。リファクタリングと、StorageのURLを外だしの設定ファイルへ。データのある行に罫線を追加。
- 0.0.4 Excelをアップロードするサンプルを追加。
- 0.0.3 Storageに置いてあるExcelファイルを取得し、Firestoreからとってきたデータを埋め込んで、ダウンロードするサンプルを追加。functions/output.xlsx をBucketにアップロードしておいてください。
- 0.0.2 Firestoreから取得したデータを整形するサンプルを追加。
- 0.0.1 初版。Firebase Cloud Functionsを使ったexcelデータをFirestoreへ投入するサンプル
