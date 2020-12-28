// @ts-nocheck - TODO: convert this file to use TypeScript namespaces
namespace gdjs {
  /**
   * Firebase Tools Collection.
   * @fileoverview
   * @author arthuro555
   */

  /**
   * Firebase Cloud database Event Tools.
   * @namespace
   */
  gdjs.evtTools.firebase.database = {};

  /**
   * (Over)writes a variable in a collection as database variable.
   * @param path - The path where to store the variable.
   * @param variable - The variable to write.
   * @param [callbackStateVariable] - The variable where to store the result.
   */
  gdjs.evtTools.firebase.database.writeVariable = function (
    path: string,
    variable: gdjs.Variable,
    callbackStateVariable?: gdjs.Variable
  ) {
    firebase
      .database()
      .ref(path)
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
   * (Over)writes a field of a database variable.
   * @param path - The path where to write the field.
   * @param field - What field to write.
   * @param value - The value to write.
   * @param [callbackStateVariable] - The variable where to store the result.
   * @param [merge] - Should the new field replace the document or be merged with the document?
   */
  gdjs.evtTools.firebase.database.writeField = function (
    path: string,
    field: string,
    value: string | number,
    callbackStateVariable?: gdjs.Variable
  ) {
    const newObject = {};
    newObject[field] = value;
    firebase
      .database()
      .ref(path)
      .set(newObject)
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
   * Updates a database variable.
   * @param path - The name under wich the variable will be saved (document name).
   * @param variable - The variable to update.
   * @param [callbackStateVariable] - The variable where to store the result.
   */
  gdjs.evtTools.firebase.database.updateVariable = function (
    path: string,
    variable: gdjs.Variable,
    callbackStateVariable?: gdjs.Variable
  ) {
    firebase
      .database()
      .ref(path)
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
   * Updates a field of a database variable.
   * @param path - The name under wich the variable will be saved (document name).
   * @param field - The field where to update.
   * @param value - The value to write.
   * @param [callbackStateVariable] - The variable where to store the result.
   */
  gdjs.evtTools.firebase.database.updateField = function (
    path: string,
    field: string,
    value: string | number,
    callbackStateVariable?: gdjs.Variable
  ) {
    const updateObject = {};
    updateObject[field] = value;
    firebase
      .database()
      .ref(path)
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
   * Deletes a database variable.
   * @param path - The name under wich the variable will be saved (document name).
   * @param [callbackStateVariable] - The variable where to store the result.
   */
  gdjs.evtTools.firebase.database.deleteVariable = function (
    path: string,
    callbackStateVariable?: gdjs.Variable
  ) {
    firebase
      .database()
      .ref(path)
      .remove()
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
   * Deletes a field of a database variable.
   * @param path - The name under wich the variable will be saved (document name).
   * @param field - The field to delete.
   * @param [callbackStateVariable] - The variable where to store the result.
   */
  gdjs.evtTools.firebase.database.deleteField = function (
    path: string,
    field: string,
    callbackStateVariable?: gdjs.Variable
  ) {
    const updateObject = {};
    updateObject[field] = null;
    firebase
      .database()
      .ref(path)
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
   * Gets a database variable and store it in a variable.
   * @param path - The name under wich the variable will be saved (document name).
   * @param callbackValueVariable - The variable where to store the result.
   * @param [callbackStateVariable] - The variable where to store if the operation was successful.
   */
  gdjs.evtTools.firebase.database.getVariable = function (
    path: string,
    callbackValueVariable: gdjs.Variable,
    callbackStateVariable?: gdjs.Variable
  ) {
    firebase
      .database()
      .ref(path)
      .once('value')
      .then(function (snapshot) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
        if (typeof callbackValueVariable !== 'undefined') {
          gdjs.evtTools.network._objectToVariable(
            snapshot.val(),
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
   * Gets a field of a database variable and store it in a variable.
   * @param path - The name under wich the variable will be saved (document name).
   * @param field - The field to get.
   * @param callbackValueVariable - The variable where to store the result.
   * @param [callbackStateVariable] - The variable where to store if the operation was successful.
   */
  gdjs.evtTools.firebase.database.getField = function (
    path: string,
    field: string,
    callbackValueVariable: gdjs.Variable,
    callbackStateVariable?: gdjs.Variable
  ) {
    firebase
      .database()
      .ref(path)
      .once('value')
      .then(function (snapshot) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
        if (typeof callbackValueVariable !== 'undefined') {
          gdjs.evtTools.network._objectToVariable(
            snapshot.val()[field],
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
   * Checks for existence of a database variable.
   * @param path - The name under wich the variable will be saved (document name).
   * @param callbackValueVariable - The variable where to store the result.
   * @param [callbackStateVariable] - The variable where to store if the operation was successful.
   */
  gdjs.evtTools.firebase.database.hasVariable = function (
    path: string,
    callbackValueVariable: gdjs.Variable,
    callbackStateVariable?: gdjs.Variable
  ) {
    firebase
      .database()
      .ref(path)
      .once('value')
      .then(function (snapshot) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
        if (typeof callbackValueVariable !== 'undefined') {
          callbackValueVariable.setString(
            snapshot.exists() && snapshot.val() !== null ? 'true' : 'false'
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
   * Checks for existence of a database variable.
   * @param path - The name under wich the variable will be saved (document name).
   * @param field - The field to check.
   * @param callbackValueVariable - The variable where to store the result.
   * @param [callbackStateVariable] - The variable where to store if the operation was successful.
   */
  gdjs.evtTools.firebase.database.hasField = function (
    path: string,
    field: string,
    callbackValueVariable: gdjs.Variable,
    callbackStateVariable?: gdjs.Variable
  ) {
    firebase
      .database()
      .ref(path)
      .once('value')
      .then(function (snapshot) {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
        if (typeof callbackValueVariable !== 'undefined') {
          callbackValueVariable.setString(
            snapshot.val() == null || snapshot.val()[field] == null
              ? 'false'
              : 'true'
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
