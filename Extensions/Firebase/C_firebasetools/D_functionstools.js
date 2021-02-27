// @ts-nocheck - TODO: convert this file to use TypeScript namespaces
/**
 * Firebase Tools Collection.
 * @fileoverview
 * @author arthuro555
 */

/**
 * Firebase Functions Event Tools.
 * @namespace
 */
gdjs.evtTools.firebase.functions = {
  /**
   * Call an http function.
   * @param {string} httpFunctionName - The name of the function to call
   * @param {string | Object} [parameters] - Parameters for the function either as a JS object or a string.
   * @param {gdjs.Variable} [callbackValueVariable] - The variable where to store the result.
   * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store if the operation was successful.
   */
  call(
    httpFunctionName,
    parameters,
    callbackValueVariable,
    callbackStateVariable
  ) {
    let param;
    try {
      param = JSON.parse(parameters);
    } catch {
      param = parameters;
    }

    firebase
      .functions()
      .httpsCallable(httpFunctionName)(param)
      .then((response) => response.data)
      .then((data) => {
        if (callbackValueVariable)
          gdjs.evtTools.network._objectToVariable(data, callbackValueVariable);
        if (typeof callbackStateVariable !== 'undefined')
          callbackStateVariable.setString('ok');
      })
      .catch((error) => {
        if (typeof callbackStateVariable !== 'undefined')
          callbackStateVariable.setString(error.message);
      });
  },
};
