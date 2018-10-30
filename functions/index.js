const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp();

exports.countResponses = functions.firestore.document('/{collection}/{key}/responses/{responseId}').onWrite(change => {
  const keyRef = (change.after.exists ? change.after : change.before).ref.parent.parent;

  return keyRef
    .collection('responses')
    .get()
    .then(querySnapshot => keyRef.update({ count: querySnapshot.size }))
    .catch(err => console.log(err));
});
