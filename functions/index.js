const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Keeps track of the length of the 'likes' child list in a separate property.
exports.countAddedResponses = functions.firestore
  .document("/{collector}/{key}/responses/{responseId}")
  .onCreate((snapshot, context) => {
    const keyRef = snapshot.ref.parent.parent;
    return keyRef.firestore
      .runTransaction(transaction => {
        // This code may get re-run multiple times if there are conflicts.
        return transaction.get(keyRef).then(function(doc) {
          if (!doc.exists) {
            transaction.set(keyRef, { count: 1 });
          } else {
            transaction.update(keyRef, { count: (doc.data().count || 0) + 1 });
          }
        });
      })
      .then(() => {
        return console.log("Response added.");
      });
  });

exports.countRemovedResponses = functions.firestore
  .document("/{collector}/{key}/responses/{responseId}")
  .onDelete((snapshot, context) => {
    const keyRef = snapshot.ref.parent.parent;
    return keyRef.firestore
      .runTransaction(transaction => {
        // This code may get re-run multiple times if there are conflicts.
        return transaction.get(keyRef).then(function(doc) {
          if (!doc.exists) {
            transaction.set(keyRef, { count: 0 });
          } else {
            transaction.update(keyRef, { count: (doc.data().count || 0) - 1 });
          }
        });
      })
      .then(() => {
        return console.log("Response removed.");
      });
  });
