const firebase = require("firebase/app");
require("firebase/firestore");

const prodConfig = {
  apiKey: FB_API_KEY,
  projectId: FB_PROJECT_ID,
  databaseURL: FB_DATABASE_URL
};

const devConfig = Object.assign({}, prodConfig);

const config = process.env.NODE_ENV === "production" ? prodConfig : devConfig;

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

const firestore = firebase.firestore();
firestore.settings({ timestampsInSnapshots: true });

module.exports = {
  firestore
};
