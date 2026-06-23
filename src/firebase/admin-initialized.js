
// src/firebase/admin-initialized.js

// This file initializes the Firebase Admin SDK for server-side scripts.
// It reuses the configuration from the main admin file.

const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');

// Initialize the app if it hasn't been initialized already
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e) {
    console.error('Firebase Admin initialization error', e);
  }
}

module.exports = { admin, app: admin.app() };
