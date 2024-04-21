namespace gdjs {
  export namespace evtTools {
    export namespace firebaseTools {
      /**
       * Firebase Cloud Firestore Event Tools.
       * @namespace
       */
      export namespace firestore {
        const queries = new Map<string, firebase.firestore.Query>();

        /**
         * Converts a firebase document snapshot to a plain dictionary,
         * so that it may be serialized or converted to a {@link gdjs.Variable}.
         *
         * @param doc - The document snapshot.
         * @returns - The converted object.
         */
        const documentSnapshotToSerializable = (
          doc: firebase.firestore.DocumentSnapshot
        ) => ({
          data: doc.data(),
          exists: doc.exists,
          id: doc.id,
        });

        /**
         * Converts a firebase query snapshot to a plain dictionary,
         * so that it may be serialized or converted to a {@link gdjs.Variable}.
         *
         * @param query - The query snapshot.
         * @returns - The converted object.
         */
        const querySnapshotToSerializable = (
          query: firebase.firestore.QuerySnapshot
        ) => ({
          size: query.size,
          empty: query.empty,
          docs: query.docs.map(documentSnapshotToSerializable),
        });

        /**
         * Initiate a query over a collection.
         * @param queryID - The name of the new query.
         * @param collectionName - The name of the collection to query.
         */
        export const startQuery = (queryID: string, collectionName: string) => {
          queries.set(queryID, firebase.firestore().collection(collectionName));
        };

        /**
         * Create a new query from a base query.
         * @param queryID - The name of the new query.
         * @param sourceQueryID - The name of the source query.
         */
        export const startQueryFrom = (
          queryID: string,
          sourceQueryID: string
        ) => {
          if (queries.has(sourceQueryID))
            queries.set(queryID, queries.get(sourceQueryID)!);
        };

        /**
         * Filters out documents whose fields do not match a condition
         * from a query.
         * @param queryID - The query to add the filter to.
         * @param field - The field to run the condition on.
         * @param op - The condition operator.
         * @param value - The value to check against.
         */
        export const queryWhere = (
          queryID: string,
          field: string,
          op: Exclude<
            firebase.firestore.WhereFilterOp,
            // Exclude unsupported "batch" operations (as they require an array as value to check)
            'in' | 'array-contains-any' | 'not-in'
          >,
          value: string | number
        ) => {
          if (queries.has(queryID))
            queries.set(queryID, queries.get(queryID)!.where(field, op, value));
        };

        /**
         * Orders the documents in a query.
         *
         * @param queryID - The query to add the filter to.
         * @param field - The field to order by.
         * @param direction - The direction of ordering (ascending or descending).
         */
        export const queryOrderBy = (
          queryID: string,
          field: string,
          direction: firebase.firestore.OrderByDirection
        ) => {
          if (queries.has(queryID))
            queries.set(
              queryID,
              queries.get(queryID)!.orderBy(field, direction)
            );
        };

        /**
         * Limits the amount of documents returned by the query.
         *
         * @param queryID - The query to add the filter to.
         * @param amount - The amount of documents to limit to
         * @param last - If true, limits to the last documents instead of the first documents.
         */
        export const queryLimit = (
          queryID: string,
          amount: integer,
          last: boolean
        ) => {
          if (queries.has(queryID))
            queries.set(
              queryID,
              queries.get(queryID)![last ? 'limitToLast' : 'limit'](amount)
            );
        };

        /**
         * Makes a query skip documents after or before a certain
         * value of a field the query was ordered with.
         *
         * @param queryID - The query to add the filter to.
         * @param value - The value of the field ordered by.
         * @param before - If set to true, all documents before the document are skipped, else all documents after it are skipped.
         * @param includeSelf - If set to true, doesn't skip the document.
         */
        export const querySkipSome = (
          queryID: string,
          value: number,
          before: boolean,
          includeSelf: boolean
        ) => {
          if (queries.has(queryID))
            queries.set(
              queryID,
              queries
                .get(queryID)!
                [
                  before
                    ? includeSelf
                      ? 'endAt'
                      : 'endBefore'
                    : includeSelf
                    ? 'startAt'
                    : 'startAfter'
                ](value)
            );
        };

        /**
         * Execute a query and store results in a callback variable.
         *
         * @param queryID - The query to execute.
         * @param [callbackValueVariable] - The variable where to store the result.
         * @param [callbackStatusVariable] - The variable where to store if the operation was successful.
         */
        export const executeQuery = (
          queryID: string,
          callbackValueVariable?: gdjs.Variable,
          callbackStatusVariable?: gdjs.Variable
        ) => {
          if (!queries.has(queryID)) return;
          queries
            .get(queryID)!
            .get()
            .then((snapshot) => {
              if (typeof callbackStatusVariable !== 'undefined')
                callbackStatusVariable.setString('ok');

              if (typeof callbackValueVariable !== 'undefined')
                callbackValueVariable.fromJSObject(
                  querySnapshotToSerializable(snapshot)
                );
            })
            .catch((error) => {
              if (typeof callbackStatusVariable !== 'undefined')
                callbackStatusVariable.setString(error.message);
            });
        };

        /**
         * Watch a query and store results in a callback
         * variable whenever a documents starts/stops
         * matching the query or a document matching
         * the query is modified.
         *
         * @param queryID - The query to execute.
         * @param [callbackValueVariable] - The variable where to store the result.
         * @param [callbackStatusVariable] - The variable where to store if the operation was successful.
         */
        export const watchQuery = (
          queryID: string,
          callbackValueVariable?: gdjs.Variable,
          callbackStatusVariable?: gdjs.Variable
        ) => {
          if (!queries.has(queryID)) return;
          queries.get(queryID)!.onSnapshot(
            (snapshot) => {
              if (typeof callbackStatusVariable !== 'undefined')
                callbackStatusVariable.setString('ok');

              if (typeof callbackValueVariable !== 'undefined')
                callbackValueVariable.fromJSObject(
                  querySnapshotToSerializable(snapshot)
                );
            },
            (error) => {
              if (typeof callbackStatusVariable !== 'undefined')
                callbackStatusVariable.setString(error.message);
            }
          );
        };

        /**
         * Adds a variable in a collection as document with a unique name.
         * @param collectionName - The collection where to store the variable.
         * @param variable - The variable to write.
         * @param [callbackStateVariable] - The variable where to store the result.
         */
        export const addDocument = (
          collectionName: string,
          variable: gdjs.Variable,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .firestore()
            .collection(collectionName)
            .add(replaceTimestampsInObject(variable.toJSObject()))
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
         * Writes a variable in a collection as document.
         * @param collectionName - The collection where to store the variable.
         * @param variableName - The name under which the variable will be saved (document name).
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
            .set(replaceTimestampsInObject(variable.toJSObject()))
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
            .set({ [field]: replaceTimestampInString(value) }, { merge: merge })
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
         * @param variableName - The name under which the variable will be saved (document name).
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
            .update(replaceTimestampsInObject(variable.toJSObject()))
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
            .update({ [field]: replaceTimestampInString(value) })
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
                callbackValueVariable.fromJSObject(doc.data());
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
                callbackValueVariable.fromJSObject(doc.get(field));
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
         *
         * @deprecated Use a query without filters instead.
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
                callbackValueVariable.fromJSObject(
                  snapshot.docs.map((doc) => doc.id)
                );
            })
            .catch((error) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString(error.message);
            });
        };

        /**
         * Returns a special string replaced by a firebase serverTimestamp field value.
         */
        export const getServerTimestamp = () =>
          '[{__FIREBASE_SERVERSIDE_TIMESTAMP}]';

        const replaceTimestampInString = (str: any) => {
          if (str === '[{__FIREBASE_SERVERSIDE_TIMESTAMP}]')
            return firebase.firestore.FieldValue.serverTimestamp();
          else return str;
        };

        const replaceTimestampsInObject = (object: object): object => {
          for (const i in object) {
            const item = object[i];
            if (typeof item === 'object') replaceTimestampsInObject(item);
            else if (item === '[{__FIREBASE_SERVERSIDE_TIMESTAMP}]')
              object[i] = firebase.firestore.FieldValue.serverTimestamp();
          }
          return object;
        };
      }
    }
  }
}
