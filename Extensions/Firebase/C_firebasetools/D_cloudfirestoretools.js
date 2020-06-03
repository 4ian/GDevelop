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
 * @param {string} collectionName - The collection where to store the variable.
 * @param {string} variableName - The name under wich the variable will be saved (document name).
 * @param {gdjs.Variable} variable - The variable to write.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
 */
gdjs.evtTools.firebase.firestore.writeDocument = function(collectionName, variableName, variable, callbackStateVariable) {
    firebase.firestore().collection(collectionName).doc(variableName).set(JSON.parse(gdjs.evtTools.network.variableStructureToJSON(variable)))
    .then(function() {
        if (callbackStateVariable)
          callbackStateVariable.setString("ok");
    })
    .catch(function(error) {
        if (callbackStateVariable)
          callbackStateVariable.setString(error.message);
    });
}

/**
 * Writes a field of a document.
 * @param {string} collectionName - The collection where to store the document.
 * @param {string} documentName - The name of the document where to write a field.
 * @param {string} field - The field where to write.
 * @param {string | number} value - The value to write.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
 * @param {boolean} [merge] - Should the new field replace the document or be merged with the document?
 */
gdjs.evtTools.firebase.firestore.writeField = function(collectionName, documentName, field, value, callbackStateVariable, merge) {
    merge = merge || true;
    const updateObject = {};
    updateObject[field] = value;
    firebase.firestore().collection(collectionName).doc(documentName).set(updateObject, {merge: true})
    .then(function() {
        if (callbackStateVariable)
          callbackStateVariable.setString("ok");
    })
    .catch(function(error) {
        if (callbackStateVariable)
          callbackStateVariable.setString(error.message);
    });
}

/**
 * Updates a variable/document.
 * @param {string} collectionName - The collection where the document is stored.
 * @param {string} variableName - The name under wich the variable will be saved (document name).
 * @param {gdjs.Variable} variable - The variable to update.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
 */
gdjs.evtTools.firebase.firestore.updateDocument = function(collectionName, variableName, variable, callbackStateVariable) {
    firebase.firestore().collection(collectionName).doc(variableName).update(JSON.parse(gdjs.evtTools.network.variableStructureToJSON(variable)))
    .then(function() {
        if (callbackStateVariable)
          callbackStateVariable.setString("ok");
    })
    .catch(function(error) {
        if (callbackStateVariable)
          callbackStateVariable.setString(error.message);
    });
}

/**
 * Updates a field of a document.
 * @param {string} collectionName - The collection where the document is stored.
 * @param {string} documentName - The name of the document where to update a field.
 * @param {string} field - The field where to update.
 * @param {string | number} value - The value to write.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
 */
gdjs.evtTools.firebase.firestore.updateField = function(collectionName, documentName, field, value, callbackStateVariable) {
    const updateObject = {};
    updateObject[field] = value;
    firebase.firestore().collection(collectionName).doc(documentName).update(updateObject)
    .then(function() {
        if (callbackStateVariable)
          callbackStateVariable.setString("ok");
    })
    .catch(function(error) {
        if (callbackStateVariable)
          callbackStateVariable.setString(error.message);
    });
}

/**
 * Deletes a document.
 * @param {string} collectionName - The collection where the document is stored.
 * @param {string} documentName - The name of the document to delete.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
 */
gdjs.evtTools.firebase.firestore.deleteDocument = function(collectionName, documentName, callbackStateVariable) {
    firebase.firestore().collection(collectionName).doc(documentName).delete()
    .then(function() {
        if (callbackStateVariable)
          callbackStateVariable.setString("ok");
    })
    .catch(function(error) {
        if (callbackStateVariable)
          callbackStateVariable.setString(error.message);
    });
}

/**
 * Deletes a field of a document.
 * @param {string} collectionName - The collection where the document is stored.
 * @param {string} documentName - The name of the document where to delete a field.
 * @param {string} field - The field to delete.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
 */
gdjs.evtTools.firebase.firestore.deleteField = function(collectionName, documentName, field, callbackStateVariable) {
    const updateObject = {};
    updateObject[field] = firebase.firestore.FieldValue.delete();
    firebase.firestore().collection(collectionName).doc(documentName).update(updateObject)
    .then(function() {
        if (callbackStateVariable)
          callbackStateVariable.setString("ok");
    })
    .catch(function(error) {
        if (callbackStateVariable)
          callbackStateVariable.setString(error.message);
    });
}

/**
 * Gets a document and store it in a variable.
 * @param {string} collectionName - The collection where the document is stored.
 * @param {string} documentName - The name of the document to get.
 * @param {gdjs.Variable} [callbackValueVariable] - The variable where to store the result.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store if the operration was successful.
 */
gdjs.evtTools.firebase.firestore.getDocument = function(collectionName, documentName, callbackValueVariable, callbackStateVariable) {
    firebase.firestore().collection(collectionName).doc(documentName).get()
    .then(function(doc) {
        if (callbackStateVariable)
          callbackStateVariable.setString("ok");
        gdjs.evtTools.network._objectToVariable(doc.data(), callbackValueVariable);
    })
    .catch(function(error) {
        if (callbackStateVariable)
          callbackStateVariable.setString(error.message);
    });
}

/**
 * Gets a field of a document and store it in a variable.
 * @param {string} collectionName - The collection where the document is stored.
 * @param {string} documentName - The name of the document.
 * @param {string} field - The field to get.
 * @param {gdjs.Variable} [callbackValueVariable] - The variable where to store the result.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store if the operration was successful.
 */
gdjs.evtTools.firebase.firestore.getField = function(collectionName, documentName, field, callbackValueVariable, callbackStateVariable) {
    firebase.firestore().collection(collectionName).doc(documentName).get()
    .then(function(doc) {
        if (callbackStateVariable)
          callbackStateVariable.setString("ok");
        gdjs.evtTools.network._objectToVariable(doc.get(field), callbackValueVariable);
    })
    .catch(function(error) {
        if (callbackStateVariable)
          callbackStateVariable.setString(error.message);
    });
}

/**
 * Checks for existence of a document.
 * @param {string} collectionName - The collection where the document is stored.
 * @param {string} documentName - The name of the document to check.
 * @param {gdjs.Variable} [callbackValueVariable] - The variable where to store the result.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store if the operration was successful.
 */
gdjs.evtTools.firebase.firestore.hasDocument = function(collectionName, documentName, callbackValueVariable, callbackStateVariable) {
    firebase.firestore().collection(collectionName).doc(documentName).get()
    .then(function(doc) {
        if (callbackStateVariable)
          callbackStateVariable.setString("ok");
        callbackValueVariable.setNumber(doc.exists ? 1 : 2);
    })
    .catch(function(error) {
        if (callbackStateVariable)
          callbackStateVariable.setString(error.message);
    });
}

/**
 * Checks for existence of a Field.
 * @param {string} collectionName - The collection where the document is stored.
 * @param {string} documentName - The name of the document.
 * @param {string} field - The field to check.
 * @param {gdjs.Variable} [callbackValueVariable] - The variable where to store the result.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store if the operration was successful.
 */
gdjs.evtTools.firebase.firestore.hasField = function(collectionName, documentName, field, callbackValueVariable, callbackStateVariable) {
    firebase.firestore().collection(collectionName).doc(documentName).get()
    .then(function(doc) {
        if (callbackStateVariable)
          callbackStateVariable.setString("ok");
        callbackValueVariable.setNumber(doc.get(field) === undefined ? 2 : 1);
    })
    .catch(function(error) {
        if (callbackStateVariable)
          callbackStateVariable.setString(error.message);
    });
}
