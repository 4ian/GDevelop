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
 * @param {string} path - The path where to store the variable.
 * @param {gdjs.Variable} variable - The variable to write.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
 */
gdjs.evtTools.firebase.database.writeVariable = function(path, variable, callbackStateVariable) {
    firebase.database().ref(path).set(JSON.parse(gdjs.evtTools.network.variableStructureToJSON(variable)))
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
 * (Over)writes a field of a database variable.
 * @param {string} path - The path where to write the field.
 * @param {string} field - What field to write.
 * @param {string | number} value - The value to write.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
 * @param {boolean} [merge] - Should the new field replace the document or be merged with the document?
 */
gdjs.evtTools.firebase.database.writeField = function(path, field, value, callbackStateVariable) {
    const newObject = {};
    newObject[field] = value;
    firebase.database().ref(path).set(newObject)
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
 * Updates a database variable.
 * @param {string} path - The name under wich the variable will be saved (document name).
 * @param {gdjs.Variable} variable - The variable to update.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
 */
gdjs.evtTools.firebase.database.updateVariable = function(path, variable, callbackStateVariable) {
    firebase.database().ref(path).update(JSON.parse(gdjs.evtTools.network.variableStructureToJSON(variable)))
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
 * Updates a field of a database variable.
 * @param {string} path - The name under wich the variable will be saved (document name).
 * @param {string} field - The field where to update.
 * @param {string | number} value - The value to write.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
 */
gdjs.evtTools.firebase.database.updateField = function(path, field, value, callbackStateVariable) {
    const updateObject = {};
    updateObject[field] = value;
    firebase.database().ref(path).update(updateObject)
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
 * Deletes a database variable.
 * @param {string} path - The name under wich the variable will be saved (document name).
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
 */
gdjs.evtTools.firebase.database.deleteVariable = function(path, callbackStateVariable) {
    firebase.database().ref(path).remove()
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
 * Deletes a field of a database variable.
 * @param {string} path - The name under wich the variable will be saved (document name).
 * @param {string} field - The field to delete.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
 */
gdjs.evtTools.firebase.database.deleteField = function(path, field, callbackStateVariable) {
    const updateObject = {};
    updateObject[field] = null;
    firebase.database().ref(path).update(updateObject)
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
 * Gets a database variable and store it in a variable.
 * @param {string} path - The name under wich the variable will be saved (document name).
 * @param {gdjs.Variable} callbackValueVariable - The variable where to store the result.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store if the operration was successful.
 */
gdjs.evtTools.firebase.database.getVariable = function(path, callbackValueVariable, callbackStateVariable) {
    firebase.database().ref(path).once("value")
    .then(function(snapshot) {
        if (callbackStateVariable)
          callbackStateVariable.setString("ok");
        gdjs.evtTools.network._objectToVariable(snapshot.val(), callbackValueVariable);
    })
    .catch(function(error) {
        if (callbackStateVariable)
          callbackStateVariable.setString(error.message);
    });
}

/**
 * Gets a field of a database variable and store it in a variable.
 * @param {string} path - The name under wich the variable will be saved (document name).
 * @param {string} field - The field to get.
 * @param {gdjs.Variable} callbackValueVariable - The variable where to store the result.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store if the operration was successful.
 */
gdjs.evtTools.firebase.database.getField = function(path, field, callbackValueVariable, callbackStateVariable) {
    firebase.database().ref(path).once("value")
    .then(function(snapshot) {
        if (callbackStateVariable)
          callbackStateVariable.setString("ok");
        gdjs.evtTools.network._objectToVariable(snapshot.val()[field], callbackValueVariable);
    })
    .catch(function(error) {
        if (callbackStateVariable)
          callbackStateVariable.setString(error.message);
    });
}

/**
 * Checks for existence of a database variable.
 * @param {string} path - The name under wich the variable will be saved (document name).
 * @param {gdjs.Variable} callbackValueVariable - The variable where to store the result.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store if the operration was successful.
 */
gdjs.evtTools.firebase.database.hasVariable = function(path, callbackValueVariable, callbackStateVariable) {
    firebase.database().ref(path).once("value")
    .then(function(snapshot) {
        if (callbackStateVariable)
          callbackStateVariable.setString("ok");
        callbackValueVariable.setNumber(snapshot.exists() && snapshot.val() !== null ? 1 : 2);
    })
    .catch(function(error) {
        if (callbackStateVariable)
          callbackStateVariable.setString(error.message);
    });
}

/**
 * Checks for existence of a database variable.
 * @param {string} path - The name under wich the variable will be saved (document name).
 * @param {string} field - The field to check.
 * @param {gdjs.Variable} callbackValueVariable - The variable where to store the result.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store if the operration was successful.
 */
gdjs.evtTools.firebase.database.hasField = function(path, field, callbackValueVariable, callbackStateVariable) {
    firebase.database().ref(path).once("value")
    .then(function(snapshot) {
        if (callbackStateVariable)
          callbackStateVariable.setString("ok");
        callbackValueVariable.setNumber(snapshot.val() == null || snapshot.val()[field] == null ? 2 : 1);
    })
    .catch(function(error) {
        if (callbackStateVariable)
          callbackStateVariable.setString(error.message);
    });
}
