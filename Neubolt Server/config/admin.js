var admin = require("firebase-admin");

var serviceAccount = require("../sdkcode.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports = { admin, db };