import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

// Firebaseのサービスアカウントキーを使う場合
import * as serviceAccount from './firebase-adminsdk.json'
const serviceAccountAny: any = serviceAccount
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountAny),
  storageBucket: 'fb2samples.appspot.com'
})

// admin.initializeApp()

import * as express from 'express'
import * as cors from 'cors'

import sampleRouter from './sampleRouter'

const app = express()
// Automatically allow cross-origin requests
app.use(cors({ origin: true }))
app.use('/samples', sampleRouter)

export const api = functions.https.onRequest(app)

