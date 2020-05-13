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
     * @param {string} [parameters] - Parameters for the function either as a JSON object or a string.
     * @param {gdjs.Variable} [callbackValueVariable] - The variable where to store the result.
     * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store if the operration was successful.
     */
    call(httpFunctionName, parameters, callbackValueVariable, callbackStateVariable) {
        let param;
        try {
            param = JSON.parse(parameters);
        } catch {
            param = parameters;
        }

        firebase.functions().httpsCallable(httpFunctionName).__call(param)
          .then(response => response.data)
          .then(data => {
              if(callbackValueVariable) 
                gdjs.evtTools.network._objectToVariable(data, callbackValueVariable);
          })
          .then(() => {
              if(callbackStateVariable) 
                callbackStateVariable.setString("ok");
          })
          .catch(error => {
            if(callbackValueVariable) 
              gdjs.evtTools.network._objectToVariable(error, callbackValueVariable);
            if(callbackStateVariable) 
              callbackStateVariable.setString("error");
          });
    }
};
