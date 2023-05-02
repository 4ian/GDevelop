namespace gdjs {
  export namespace evtTools {
    export namespace firebaseTools {
      /**
       * Firebase Cloud database Event Tools.
       * @namespace
       */
      export namespace database {
        /**
         * (Over)writes a variable in a collection as database variable.
         * @param path - The path where to store the variable.
         * @param variable - The variable to write.
         * @param [callbackStateVariable] - The variable where to store the result.
         */
        export const writeVariable = (
          path: string,
          variable: gdjs.Variable,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .database()
            .ref(path)
            .set(variable.toJSObject())
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
         * (Over)writes a field of a database variable.
         * @param path - The path where to write the field.
         * @param field - What field to write.
         * @param value - The value to write.
         * @param [callbackStateVariable] - The variable where to store the result.
         */
        export const writeField = (
          path: string,
          field: string,
          value: string | number,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .database()
            .ref(path)
            .set({ [field]: value })
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
         * Updates a database variable.
         * @param path - The name under which the variable will be saved (document name).
         * @param variable - The variable to update.
         * @param [callbackStateVariable] - The variable where to store the result.
         */
        export const updateVariable = (
          path: string,
          variable: gdjs.Variable,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .database()
            .ref(path)
            .update(variable.toJSObject())
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
         * Updates a field of a database variable.
         * @param path - The name under which the variable will be saved (document name).
         * @param field - The field where to update.
         * @param value - The value to write.
         * @param [callbackStateVariable] - The variable where to store the result.
         */
        export const updateField = (
          path: string,
          field: string,
          value: string | number,
          callbackStateVariable?: gdjs.Variable
        ) => {
          const updateObject = {};
          updateObject[field] = value;
          firebase
            .database()
            .ref(path)
            .update(updateObject)
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
         * Deletes a database variable.
         * @param path - The name under which the variable will be saved (document name).
         * @param [callbackStateVariable] - The variable where to store the result.
         */
        export const deleteVariable = (
          path: string,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .database()
            .ref(path)
            .remove()
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
         * Deletes a field of a database variable.
         * @param path - The name under which the variable will be saved (document name).
         * @param field - The field to delete.
         * @param [callbackStateVariable] - The variable where to store the result.
         */
        export const deleteField = (
          path: string,
          field: string,
          callbackStateVariable?: gdjs.Variable
        ) => {
          const updateObject = {};
          updateObject[field] = null;
          firebase
            .database()
            .ref(path)
            .update(updateObject)
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
         * Gets a database variable and store it in a variable.
         * @param path - The name under which the variable will be saved (document name).
         * @param callbackValueVariable - The variable where to store the result.
         * @param [callbackStateVariable] - The variable where to store if the operation was successful.
         */
        export const getVariable = (
          path: string,
          callbackValueVariable: gdjs.Variable,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .database()
            .ref(path)
            .once('value')
            .then((snapshot) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString('ok');

              if (typeof callbackValueVariable !== 'undefined')
                callbackValueVariable.fromJSObject(snapshot.val());
            })
            .catch((error) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString(error.message);
            });
        };

        /**
         * Gets a field of a database variable and store it in a variable.
         * @param path - The name under which the variable will be saved (document name).
         * @param field - The field to get.
         * @param callbackValueVariable - The variable where to store the result.
         * @param [callbackStateVariable] - The variable where to store if the operation was successful.
         */
        export const getField = (
          path: string,
          field: string,
          callbackValueVariable: gdjs.Variable,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .database()
            .ref(path)
            .once('value')
            .then((snapshot) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString('ok');

              if (typeof callbackValueVariable !== 'undefined')
                callbackValueVariable.fromJSObject(snapshot.val()[field]);
            })
            .catch((error) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString(error.message);
            });
        };

        /**
         * Checks for existence of a database variable.
         * @param path - The name under which the variable will be saved (document name).
         * @param callbackValueVariable - The variable where to store the result.
         * @param [callbackStateVariable] - The variable where to store if the operation was successful.
         */
        export const hasVariable = (
          path: string,
          callbackValueVariable: gdjs.Variable,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .database()
            .ref(path)
            .once('value')
            .then((snapshot) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString('ok');

              if (typeof callbackValueVariable !== 'undefined')
                callbackValueVariable.setBoolean(
                  snapshot.exists() &&
                    snapshot.val() !== null &&
                    snapshot.val() !== undefined
                );
            })
            .catch((error) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString(error.message);
            });
        };

        /**
         * Checks for existence of a database variable.
         * @param path - The name under which the variable will be saved (document name).
         * @param field - The field to check.
         * @param callbackValueVariable - The variable where to store the result.
         * @param [callbackStateVariable] - The variable where to store if the operation was successful.
         */
        export const hasField = (
          path: string,
          field: string,
          callbackValueVariable: gdjs.Variable,
          callbackStateVariable?: gdjs.Variable
        ) => {
          firebase
            .database()
            .ref(path)
            .once('value')
            .then((snapshot) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString('ok');

              if (typeof callbackValueVariable !== 'undefined') {
                const value = snapshot.val()[field];
                callbackValueVariable.setBoolean(
                  snapshot.exists() && value !== null && value !== undefined
                );
              }
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
