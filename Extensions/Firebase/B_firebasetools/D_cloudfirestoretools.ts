namespace gdjs {
  export namespace evtTools {
    export namespace firebaseTools {
      /**
       * Firebase Cloud Firestore Event Tools.
       * @namespace
       */
      export namespace firestore {
        /**
         * Writes a variable in a collection as document.
         * @param collectionName - The collection where to store the variable.
         * @param variableName - The name under wich the variable will be saved (document name).
         * @param variable - The variable to write.
         * @param [callbackStateVariable] - The variable where to store the result.
         */
        export const writeDocument = (
          collectionName: string,
          variableName: string,
          variable: gdjs.Variable,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .firestore()
            .collection(collectionName)
            .doc(variableName)
            .set(
              JSON.parse(
                gdjs.evtTools.network.variableStructureToJSON(variable)
              )
            )
            .then(() => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString('ok');
            })
            .catch((error) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString(error.message);
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
        export const writeField = (
          collectionName: string,
          documentName: string,
          field: string,
          value: any,
          callbackStateVariable?: gdjs.Variable,
          merge: boolean = true
        ) => {
          firebase
            .firestore()
            .collection(collectionName)
            .doc(documentName)
            .set({ [field]: value }, { merge: merge })
            .then(() => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString('ok');
            })
            .catch((error) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString(error.message);
            });
        };

        /**
         * Updates a variable/document.
         * @param collectionName - The collection where the document is stored.
         * @param variableName - The name under wich the variable will be saved (document name).
         * @param variable - The variable to update.
         * @param [callbackStateVariable] - The variable where to store the result.
         */
        export const updateDocument = (
          collectionName: string,
          variableName: string,
          variable: gdjs.Variable,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .firestore()
            .collection(collectionName)
            .doc(variableName)
            .update(
              JSON.parse(
                gdjs.evtTools.network.variableStructureToJSON(variable)
              )
            )
            .then(() => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString('ok');
            })
            .catch((error) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString(error.message);
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
        export const updateField = (
          collectionName: string,
          documentName: string,
          field: string,
          value: any,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .firestore()
            .collection(collectionName)
            .doc(documentName)
            .update({ [field]: value })
            .then(() => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString('ok');
            })
            .catch((error) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString(error.message);
            });
        };

        /**
         * Deletes a document.
         * @param collectionName - The collection where the document is stored.
         * @param documentName - The name of the document to delete.
         * @param [callbackStateVariable] - The variable where to store the result.
         */
        export const deleteDocument = (
          collectionName: string,
          documentName: string,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .firestore()
            .collection(collectionName)
            .doc(documentName)
            .delete()
            .then(() => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString('ok');
            })
            .catch((error) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString(error.message);
            });
        };

        /**
         * Deletes a field of a document.
         * @param collectionName - The collection where the document is stored.
         * @param documentName - The name of the document where to delete a field.
         * @param field - The field to delete.
         * @param [callbackStateVariable] - The variable where to store the result.
         */
        export const deleteField = (
          collectionName: string,
          documentName: string,
          field: string,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .firestore()
            .collection(collectionName)
            .doc(documentName)
            .update({ [field]: firebase.firestore.FieldValue.delete() })
            .then(() => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString('ok');
            })
            .catch((error) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString(error.message);
            });
        };

        /**
         * Gets a document and store it in a variable.
         * @param collectionName - The collection where the document is stored.
         * @param documentName - The name of the document to get.
         * @param [callbackValueVariable] - The variable where to store the result.
         * @param [callbackStateVariable] - The variable where to store if the operation was successful.
         */
        export const getDocument = (
          collectionName: string,
          documentName: string,
          callbackValueVariable?: gdjs.Variable,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .firestore()
            .collection(collectionName)
            .doc(documentName)
            .get()
            .then((doc) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString('ok');

              if (callbackValueVariable)
                gdjs.evtTools.network._objectToVariable(
                  doc.data(),
                  callbackValueVariable
                );
            })
            .catch((error) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString(error.message);
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
        export const getField = (
          collectionName: string,
          documentName: string,
          field: string,
          callbackValueVariable?: gdjs.Variable,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .firestore()
            .collection(collectionName)
            .doc(documentName)
            .get()
            .then((doc) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString('ok');

              if (callbackValueVariable)
                gdjs.evtTools.network._objectToVariable(
                  doc.get(field),
                  callbackValueVariable
                );
            })
            .catch((error) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString(error.message);
            });
        };

        /**
         * Checks for existence of a document.
         * @param collectionName - The collection where the document is stored.
         * @param documentName - The name of the document to check.
         * @param [callbackValueVariable] - The variable where to store the result.
         * @param [callbackStateVariable] - The variable where to store if the operation was successful.
         */
        export const hasDocument = (
          collectionName: string,
          documentName: string,
          callbackValueVariable?: gdjs.Variable,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .firestore()
            .collection(collectionName)
            .doc(documentName)
            .get()
            .then((doc) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString('ok');

              if (callbackValueVariable)
                callbackValueVariable.setBoolean(doc.exists);
            })
            .catch((error) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString(error.message);
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
        export const hasField = (
          collectionName: string,
          documentName: string,
          field: string,
          callbackValueVariable?: gdjs.Variable,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .firestore()
            .collection(collectionName)
            .doc(documentName)
            .get()
            .then((doc) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString('ok');

              if (callbackValueVariable) {
                const value = doc.get(field, { serverTimestamps: 'estimate' });
                callbackValueVariable.setBoolean(
                  doc.exists && value !== undefined && value !== null
                );
              }
            })
            .catch((error) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString(error.message);
            });
        };

        /**
         * Lists all the documents in a collection.
         * @param collectionName - The collection where to count documents.
         * @param [callbackValueVariable] - The variable where to store the result.
         * @param [callbackStateVariable] - The variable where to store if the operation was successful.
         */
        export const listDocuments = (
          collectionName: string,
          callbackValueVariable?: gdjs.Variable,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .firestore()
            .collection(collectionName)
            .get()
            .then((snapshot) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString(
                  snapshot.empty ? 'empty' : 'ok'
                );

              if (callbackValueVariable)
                gdjs.evtTools.network._objectToVariable(
                  snapshot.docs.map((doc) => doc.id),
                  callbackValueVariable
                );
            })
            .catch((error) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString(error.message);
            });
        };
      }
    }
  }
}
