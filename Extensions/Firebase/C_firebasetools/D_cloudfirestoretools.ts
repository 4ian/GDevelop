namespace gdjs {
  /**
   * Firebase Tools Collection.
   * @fileoverview
   * @author arthuro555
   */

  /**
   * Firebase Cloud Firestore Event Tools.
   * @namespace
   */
  gdjs.evtTools.firebase.firestore = {};

  /**
   * Writes a variable in a collection as document.
   * @param collectionName - The collection where to store the variable.
   * @param variableName - The name under wich the variable will be saved (document name).
   * @param variable - The variable to write.
   * @param [callbackStateVariable] - The variable where to store the result.
   */
  gdjs.evtTools.firebase.firestore.writeDocument = function (
    collectionName: string,
    variableName: string,
    variable: gdjs.Variable,
    callbackStateVariable?: gdjs.Variable
  ) {
    firebase
      .firestore()
      .collection(collectionName)
      .doc(variableName)
      .set(JSON.parse(gdjs.evtTools.network.variableStructureToJSON(variable)))
      .then(function () {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
      })
      .catch(function (error) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString(error.message);
        }
      });
  };

  /**
   * Writes a field of a document.
   * @param collectionName - The collection where to store the document.
   * @param documentName - The name of the document where to write a field.
   * @param field - The field where to write.
   * @param value - The value to write.
   * @param [callbackStateVariable] - The variable where to store the result.
   * @param [merge] - Should the new field replace the document or be merged with the document?
   */
  gdjs.evtTools.firebase.firestore.writeField = function (
    collectionName: string,
    documentName: string,
    field: string,
    value: string | number,
    callbackStateVariable?: gdjs.Variable,
    merge?: boolean
  ) {
    merge = merge == undefined ? true : merge;
    const updateObject = {};
    updateObject[field] = value;
    firebase
      .firestore()
      .collection(collectionName)
      .doc(documentName)
      .set(updateObject, { merge: merge })
      .then(function () {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
      })
      .catch(function (error) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString(error.message);
        }
      });
  };

  /**
   * Updates a variable/document.
   * @param collectionName - The collection where the document is stored.
   * @param variableName - The name under wich the variable will be saved (document name).
   * @param variable - The variable to update.
   * @param [callbackStateVariable] - The variable where to store the result.
   */
  gdjs.evtTools.firebase.firestore.updateDocument = function (
    collectionName: string,
    variableName: string,
    variable: gdjs.Variable,
    callbackStateVariable?: gdjs.Variable
  ) {
    firebase
      .firestore()
      .collection(collectionName)
      .doc(variableName)
      .update(
        JSON.parse(gdjs.evtTools.network.variableStructureToJSON(variable))
      )
      .then(function () {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
      })
      .catch(function (error) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString(error.message);
        }
      });
  };

  /**
   * Updates a field of a document.
   * @param collectionName - The collection where the document is stored.
   * @param documentName - The name of the document where to update a field.
   * @param field - The field where to update.
   * @param value - The value to write.
   * @param [callbackStateVariable] - The variable where to store the result.
   */
  gdjs.evtTools.firebase.firestore.updateField = function (
    collectionName: string,
    documentName: string,
    field: string,
    value: string | number,
    callbackStateVariable?: gdjs.Variable
  ) {
    const updateObject = {};
    updateObject[field] = value;
    firebase
      .firestore()
      .collection(collectionName)
      .doc(documentName)
      .update(updateObject)
      .then(function () {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
      })
      .catch(function (error) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString(error.message);
        }
      });
  };

  /**
   * Deletes a document.
   * @param collectionName - The collection where the document is stored.
   * @param documentName - The name of the document to delete.
   * @param [callbackStateVariable] - The variable where to store the result.
   */
  gdjs.evtTools.firebase.firestore.deleteDocument = function (
    collectionName: string,
    documentName: string,
    callbackStateVariable?: gdjs.Variable
  ) {
    firebase
      .firestore()
      .collection(collectionName)
      .doc(documentName)
      .delete()
      .then(function () {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
      })
      .catch(function (error) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString(error.message);
        }
      });
  };

  /**
   * Deletes a field of a document.
   * @param collectionName - The collection where the document is stored.
   * @param documentName - The name of the document where to delete a field.
   * @param field - The field to delete.
   * @param [callbackStateVariable] - The variable where to store the result.
   */
  gdjs.evtTools.firebase.firestore.deleteField = function (
    collectionName: string,
    documentName: string,
    field: string,
    callbackStateVariable?: gdjs.Variable
  ) {
    const updateObject = {};
    updateObject[field] = firebase.firestore.FieldValue.delete();
    firebase
      .firestore()
      .collection(collectionName)
      .doc(documentName)
      .update(updateObject)
      .then(function () {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
      })
      .catch(function (error) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString(error.message);
        }
      });
  };

  /**
   * Gets a document and store it in a variable.
   * @param collectionName - The collection where the document is stored.
   * @param documentName - The name of the document to get.
   * @param [callbackValueVariable] - The variable where to store the result.
   * @param [callbackStateVariable] - The variable where to store if the operation was successful.
   */
  gdjs.evtTools.firebase.firestore.getDocument = function (
    collectionName: string,
    documentName: string,
    callbackValueVariable?: gdjs.Variable,
    callbackStateVariable?: gdjs.Variable
  ) {
    firebase
      .firestore()
      .collection(collectionName)
      .doc(documentName)
      .get()
      .then(function (doc) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
        if (callbackValueVariable) {
          gdjs.evtTools.network._objectToVariable(
            doc.data(),
            callbackValueVariable
          );
        }
      })
      .catch(function (error) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString(error.message);
        }
      });
  };

  /**
   * Gets a field of a document and store it in a variable.
   * @param collectionName - The collection where the document is stored.
   * @param documentName - The name of the document.
   * @param field - The field to get.
   * @param [callbackValueVariable] - The variable where to store the result.
   * @param [callbackStateVariable] - The variable where to store if the operation was successful.
   */
  gdjs.evtTools.firebase.firestore.getField = function (
    collectionName: string,
    documentName: string,
    field: string,
    callbackValueVariable?: gdjs.Variable,
    callbackStateVariable?: gdjs.Variable
  ) {
    firebase
      .firestore()
      .collection(collectionName)
      .doc(documentName)
      .get()
      .then(function (doc) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
        if (callbackValueVariable) {
          gdjs.evtTools.network._objectToVariable(
            doc.get(field),
            callbackValueVariable
          );
        }
      })
      .catch(function (error) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString(error.message);
        }
      });
  };

  /**
   * Checks for existence of a document.
   * @param collectionName - The collection where the document is stored.
   * @param documentName - The name of the document to check.
   * @param [callbackValueVariable] - The variable where to store the result.
   * @param [callbackStateVariable] - The variable where to store if the operation was successful.
   */
  gdjs.evtTools.firebase.firestore.hasDocument = function (
    collectionName: string,
    documentName: string,
    callbackValueVariable?: gdjs.Variable,
    callbackStateVariable?: gdjs.Variable
  ) {
    firebase
      .firestore()
      .collection(collectionName)
      .doc(documentName)
      .get()
      .then(function (doc) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
        if (callbackValueVariable) {
          callbackValueVariable.setString(doc.exists ? 'true' : 'false');
        }
      })
      .catch(function (error) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString(error.message);
        }
      });
  };

  /**
   * Checks for existence of a field.
   * @param collectionName - The collection where the document is stored.
   * @param documentName - The name of the document.
   * @param field - The field to check.
   * @param [callbackValueVariable] - The variable where to store the result.
   * @param [callbackStateVariable] - The variable where to store if the operation was successful.
   */
  gdjs.evtTools.firebase.firestore.hasField = function (
    collectionName: string,
    documentName: string,
    field: string,
    callbackValueVariable?: gdjs.Variable,
    callbackStateVariable?: gdjs.Variable
  ) {
    firebase
      .firestore()
      .collection(collectionName)
      .doc(documentName)
      .get()
      .then(function (doc) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
        if (callbackValueVariable) {
          callbackValueVariable.setString(
            doc.get(field) === undefined ? 'false' : 'true'
          );
        }
      })
      .catch(function (error) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString(error.message);
        }
      });
  };

  /**
   * Lists all the documents in a collection.
   * @param collectionName - The collection where to count documents.
   * @param [callbackValueVariable] - The variable where to store the result.
   * @param [callbackStateVariable] - The variable where to store if the operation was successful.
   */
  gdjs.evtTools.firebase.firestore.listDocuments = function (
    collectionName: string,
    callbackValueVariable?: gdjs.Variable,
    callbackStateVariable?: gdjs.Variable
  ) {
    firebase
      .firestore()
      .collection(collectionName)
      .get()
      .then(function (snapshot) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString(snapshot.empty ? 'empty' : 'ok');
        }
        if (callbackValueVariable) {
          gdjs.evtTools.network._objectToVariable(
            snapshot.docs.map((doc) => doc.id),
            callbackValueVariable
          );
        }
      })
      .catch(function (error) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString(error.message);
        }
      });
  };
}
